import ticketRepositories from "../repositories/ticket-repositories.js";
import response from "../../../utils/response.js";
import InvariantError from "../../../exceptions/invariant-error.js";
import NotFoundError from "../../../exceptions/not-found-error.js";

export const addTicket = async (req, res, next) => {
    try {
        const { title, category, priority, description, issue_image } = req.validated;
        const reporter_id = req.user.id;

        const ticket = await ticketRepositories.addTicket({
            title, category, priority, description, reporter_id, issue_image
        });

        if (!ticket) {
            throw new InvariantError('Ticket gagal ditambahkan');
        }

        return response(res, 201, "Ticket berhasil ditambahkan", { ticket });

    } catch (error) {
        return next(error);
    }
}

export const getTickets = async (req, res, next) => {
    try {
        const role = req.user.role;
        const department = req.user.department; // Menarik data departemen dari token JWT

        let tickets;
        if (role === 'IT_STAFF' || role === 'ADMIN') {
            // Staf IT mengambil antrean seluruh tiket global
            tickets = await ticketRepositories.getAllTicket();
        } else {
            // Karyawan biasa (Humas, Clinic, dll) mengambil tiket divisinya saja
            tickets = await ticketRepositories.getTicketsByDepartment(department);
        }

        return response(res, 200, 'Ticket berhasil ditampilkan', { tickets });
    } catch (err) {
        return next(err);
    }
}

export const updateTicketStatus = async (req, res, next) => {
    try {
        const role = req.user.role;
        const userId = req.user.id;

        if (role !== 'IT_STAFF' && role !== 'ADMIN') {
            throw new InvariantError('Akses ditolak. Hanya IT Staff yang dapat mengubah status tiket.');
        }

        const { id } = req.params;
        const { status, resolution_notes, resolution_image } = req.body;

        const existingTicket = await ticketRepositories.getTicketById(id);
        if (!existingTicket) throw new NotFoundError('Ticket tidak ditemukan');

        if (status === 'RESOLVED' && role === 'IT_STAFF') {
            if (String(existingTicket.assignee_id) !== String(userId)) {
                throw new InvariantError('Akses ditolak. Hanya teknisi yang ditugaskan yang dapat menyelesaikan tiket ini.');
            }
        }

        if (status === 'IN_PROGRESS' && role === 'IT_STAFF' && existingTicket.status === 'OPEN') {
            if (req.user.specialization && String(req.user.specialization).toUpperCase() !== String(existingTicket.category).toUpperCase()) {
                throw new InvariantError('Akses ditolak. Kategori tiket di luar batas keahlian Anda.');
            }
        }

        const ticket = await ticketRepositories.updateTicketStatus(id, status, userId, resolution_notes, resolution_image);

        return response(res, 200, 'Ticket berhasil diperbarui', { ticket });

    } catch (err) {
        return next(err);
    }
}

export const deleteTicket = async (req, res, next) => {
    try {
        const role = req.user.role;
        
        if (role !== 'IT_STAFF' && role !== 'ADMIN') {
            throw new InvariantError('Akses ditolak. Hanya IT Staff yang dapat menghapus tiket.');
        }

        const { id } = req.params;
        await ticketRepositories.deleteTicket(id);

        return response(res, 200, 'Ticket berhasil dihapus', null);

    } catch (err) {
        return next(err);
    }
}

export const assignTicket = async (req, res, next) => {
    try {
        const role = req.user.role;
        
        if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
            throw new InvariantError('Akses ditolak. Hanya Superadmin yang dapat melakukan penugasan tiket.');
        }

        const { id } = req.params;
        const { assignee_id, assignment_note } = req.body;
        const assigner_id = req.user.id;

        if (!assignee_id) {
            throw new InvariantError('Technician ID (assignee_id) harus disertakan');
        }
        if (!assignment_note) {
            throw new InvariantError('Catatan untuk pelapor (assignment_note) harus disertakan');
        }

        const ticket = await ticketRepositories.assignTicket(id, assignee_id, assigner_id, assignment_note);

        return response(res, 200, 'Ticket berhasil ditugaskan', { ticket });
    } catch (err) {
        return next(err);
    }
}

export const claimTicket = async (req, res, next) => {
    try {
        const role = req.user.role;
        const userId = req.user.id;
        const userSpecialization = req.user.specialization;

        if (role !== 'IT_STAFF') {
            throw new InvariantError('Akses ditolak. Hanya Teknisi yang dapat melakukan klaim tiket.');
        }

        const { id } = req.params;
        const { assignment_note } = req.body;

        if (!assignment_note) {
            throw new InvariantError('Catatan untuk pelapor (assignment_note) harus disertakan');
        }

        const existingTicket = await ticketRepositories.getTicketById(id);
        if (!existingTicket) throw new NotFoundError('Ticket tidak ditemukan');

        if (existingTicket.status !== 'OPEN') {
            throw new InvariantError('Tiket tidak dapat diklaim karena statusnya bukan OPEN.');
        }

        if (existingTicket.category !== userSpecialization) {
            throw new InvariantError('Kategori tiket tidak sesuai dengan spesialisasi Anda.');
        }

        const ticket = await ticketRepositories.assignTicket(id, userId, userId, assignment_note);

        return response(res, 200, 'Ticket berhasil diklaim', { ticket });
    } catch (err) {
        return next(err);
    }
}

export const confirmTicket = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { action, rating, feedback_note } = req.validated;
        const userId = req.user.id;

        const existingTicket = await ticketRepositories.getTicketById(id);
        if (!existingTicket) throw new NotFoundError('Ticket tidak ditemukan');

        if (String(existingTicket.reporter_id) !== String(userId)) {
            throw new InvariantError('Akses ditolak. Hanya pembuat tiket yang dapat memberikan feedback.');
        }

        if (existingTicket.status !== 'RESOLVED') {
            throw new InvariantError('Feedback hanya dapat diberikan pada tiket yang sudah diselesaikan (RESOLVED).');
        }

        let updatedTicket;
        if (action === 'CLOSED') {
            updatedTicket = await ticketRepositories.updateTicketFeedback(id, rating, feedback_note, 'CLOSED');
        } else if (action === 'RE-OPENED') {
            updatedTicket = await ticketRepositories.updateTicketFeedback(id, rating, feedback_note, 'RE-OPENED');
        }

        return response(res, 200, 'Konfirmasi berhasil diproses', { ticket: updatedTicket });
    } catch (err) {
        return next(err);
    }
}