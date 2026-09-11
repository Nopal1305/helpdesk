import authRepositories from "../repositories/auth-repositories.js";
import bcrypt from 'bcrypt';
import InvariantError from "../../../exceptions/invariant-error.js";
import response from "../../../utils/response.js";
import TokenManager from "../../../security/token-manager.js";
import ticketRepositories from "../../tickets/repositories/ticket-repositories.js";

export const register = async (req, res, next) => {
    try {
        const { fullName, email, password, role, department } = req.validated;
        const cekEmail = await authRepositories.getUserbyEmail(email);
        if (cekEmail) {
            throw new InvariantError('Email sudah terdaftar');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await authRepositories.addUser({
            fullName, email, password: hashedPassword, role: role || 'EMPLOYEE', department
        });
        return response(res, 201, 'Akun berhasil ditambahkan', { user });
    } catch (err) {
        return next(err);
    }
}

export const registerTech = async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') {
            throw new InvariantError('Hanya superadmin yang dapat menambahkan teknisi');
        }
        const { fullName, email, password, specialization } = req.body; // or req.validated if there is a validator
        const cekEmail = await authRepositories.getUserbyEmail(email);
        if (cekEmail) {
            throw new InvariantError('Email sudah terdaftar');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await authRepositories.addTech({
            fullName, email, password: hashedPassword, specialization
        });
        return response(res, 201, 'Akun teknisi berhasil ditambahkan', { user });
    } catch (err) {
        return next(err);
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await authRepositories.getUserbyEmail(email);
        if (!user) {
            throw new InvariantError('Email/Password salah');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new InvariantError('Email/Password salah');
        }

        // Modifikasi: Menambahkan department dan specialization ke dalam payload JWT
        const payload = {
            id: user.id,
            role: user.role,
            department: user.department,
            specialization: user.specialization
        }
        
        const loginCount = await authRepositories.incrementLoginCount(user.id);

        const accessToken = await TokenManager.generateAccessToken(payload);
        const refreshToken = await TokenManager.generateRefreshToken(payload);

        await authRepositories.addRefreshToken(refreshToken);
        
        // Modifikasi: Menambahkan department dan specialization ke response agar frontend (React) bisa membacanya
        return response(res, 200, 'Login Berhasil', { 
            accessToken, 
            refreshToken, 
            user: { 
                id: user.id, 
                fullname: user.full_name, 
                email: user.email,
                role: user.role, 
                department: user.department,
                specialization: user.specialization,
                login_count: loginCount
            } 
        });
    } catch (err) {
        return next(err);
    }
}

export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new InvariantError('RefreshToken tidak ada');
        }

        const payload = TokenManager.verifyRefreshToken(refreshToken);
        await authRepositories.checkRefreshToken(payload);
        
        // Modifikasi: Menyisipkan kembali department saat membuat ulang Access Token
        const newAccesToken = await TokenManager.generateAccessToken({ 
            id: payload.id, 
            role: payload.role,
            department: payload.department 
        });
        
        // Perbaikan: Memperbaiki typo string literal dari kode sebelumnya
        return response(res, 200, 'Access token berhasil diperbarui', { accessToken: newAccesToken });
    } catch (err) {
        return next(err);
    }
}

export const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new InvariantError('Refresh token tidak dikirimkan');
        }

        await authRepositories.checkRefreshToken(refreshToken);
        await authRepositories.deleteRefreshToken(refreshToken);

        return response(res, 200, 'Logout berhasil', null);
    } catch (err) {
        return next(err);
    }
}

export const updateProfile = async (req, res, next) => {
    try {
        const { fullName } = req.validated;
        const userId = req.user.id;
        
        const newFullName = await authRepositories.updateProfile(userId, fullName);
        
        return response(res, 200, 'Profil berhasil diperbarui', { fullName: newFullName });
    } catch (err) {
        return next(err);
    }
}

export const updatePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.validated;
        const userId = req.user.id;

        const user = await authRepositories.getUserById(userId);
        if (!user) {
            throw new InvariantError('Pengguna tidak ditemukan');
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new InvariantError('Password saat ini salah');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await authRepositories.updatePassword(userId, hashedNewPassword);

        return response(res, 200, 'Password berhasil diperbarui');
    } catch (err) {
        return next(err);
    }
}

export const getUsers = async (req, res, next) => {
    try {
        const users = await authRepositories.getAllUsers();
        return response(res, 200, 'Berhasil mengambil data pengguna', users);
    } catch (err) {
        return next(err);
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        await authRepositories.deleteUser(id);
        return response(res, 200, 'Berhasil menghapus pengguna');
    } catch (err) {
        return next(err);
    }
}

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) throw new InvariantError('Email harus diisi');

        const user = await authRepositories.getUserbyEmail(email);
        if (!user) {
            // Silently return success to avoid email enumeration, but for demo we can be verbose
            throw new InvariantError('Email tidak terdaftar');
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Expires in 15 minutes
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await authRepositories.saveResetOtp(email, otp, expiresAt);

        // In a real app, send email here. For demo, we return the OTP.
        return response(res, 200, 'Mock Email: OTP terkirim ke email Anda', { otp });
    } catch (err) {
        return next(err);
    }
}

export const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            throw new InvariantError('Semua kolom harus diisi');
        }

        if (newPassword.length < 6) {
            throw new InvariantError('Password minimal 6 karakter');
        }

        const isValid = await authRepositories.verifyResetOtp(email, otp);
        if (!isValid) {
            throw new InvariantError('OTP tidak valid atau sudah kedaluwarsa');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await authRepositories.updatePasswordByEmail(email, hashedPassword);
        await authRepositories.clearResetOtp(email);

        return response(res, 200, 'Password berhasil direset. Silakan login dengan password baru.');
    } catch (err) {
        return next(err);
    }
}

export const getUserDetailsAndStats = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await authRepositories.getUserById(id);
        if (!user) {
            throw new InvariantError('Pengguna tidak ditemukan');
        }

        const tickets = await ticketRepositories.getTicketsByUserRole(id, user.role);

        let stats = {};
        if (user.role === 'EMPLOYEE') {
            const total = tickets.length;
            const active = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'RE-OPENED').length;
            const completed = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
            stats = { total, active, completed };
        } else if (user.role === 'SUPERADMIN' || user.role === 'ADMIN') {
            const totalAssigned = tickets.length;
            const totalUsers = await authRepositories.getTotalUsers();
            stats = { totalAssigned, totalUsers };
        } else {
            const completed = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
            const reopened = tickets.filter(t => t.status === 'RE-OPENED').length;
            const ticketsWithRating = tickets.filter(t => t.rating != null);
            const averageRating = ticketsWithRating.length 
                ? (ticketsWithRating.reduce((acc, t) => acc + t.rating, 0) / ticketsWithRating.length).toFixed(1) 
                : 0;
            stats = { averageRating: parseFloat(averageRating), completed, reopened };
        }

        // Return user info minus password
        const { password, reset_otp, reset_otp_expires, ...safeUser } = user;
        
        return response(res, 200, 'Berhasil mengambil detail pengguna', { user: safeUser, stats, tickets });
    } catch (err) {
        return next(err);
    }
}