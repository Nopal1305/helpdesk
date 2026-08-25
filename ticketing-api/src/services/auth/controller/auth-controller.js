import authRepositories from "../repositories/auth-repositories.js";
import bcrypt from 'bcrypt';
import InvariantError from "../../../exceptions/invariant-error.js";
import response from "../../../utils/response.js";
import TokenManager from "../../../security/token-manager.js";

export const register = async (req, res, next) => {
    try {
        const { fullName, email, password, role, department } = req.validated;
        const cekEmail = await authRepositories.getUserbyEmail(email)
        if (cekEmail) {
            throw new InvariantError('Email sudah terdaftar')
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await authRepositories.addUser({
            fullName, email, password: hashedPassword, role: role || 'EMPLOYEE', department
        })
        return response(res, 201, 'Akun berhasil ditambahkan', { user })
    } catch (err) {
        return next(err)
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await authRepositories.getUserbyEmail(email);
        if (!user) {
            throw new InvariantError('Email/Password salah')
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new InvariantError('Email/Password salah')
        }

        const payload = {
            id: user.id,
            role: user.role
        }
        const accessToken = await TokenManager.generateAccessToken(payload);
        const refreshToken = await TokenManager.generateRefreshToken(payload)

        await authRepositories.addRefreshToken(refreshToken)
        return response(res, 200, 'Login Berhasil', { accessToken, refreshToken, user: { id: user.id, fullname: user.full_name, role: user.role } })
    } catch (err) {
        return next(err)
    }
}

export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new InvariantError('RefreshToken tidak ada')
        }

        const payload = TokenManager.verifyRefreshToken(refreshToken);
        await authRepositories.checkRefreshToken(payload)
        const newAccesToken = await TokenManager.generateAccessToken({ id: payload.id, role: payload.role })
        return response(res, 200, 'Access token berhasil diperbarui, {accessToken: newAccessToken}')
    } catch (err) {
        return next(err)
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
        return next(err)
    }
}