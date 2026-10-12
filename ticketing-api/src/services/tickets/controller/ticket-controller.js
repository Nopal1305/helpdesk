import ticketRepositories from "../repositories/ticket-repositories.js";
import response from "../../../utils/response.js";
import fs from 'fs';
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

        if (role !== 'IT_STAFF' && role !== 'ADMIN' && role !== 'SUPERADMIN') {
            throw new InvariantError('Akses ditolak. Hanya IT Staff, Admin, atau Superadmin yang dapat mengubah status tiket.');
        }

        const { id } = req.params;
        const { status, resolution_notes, resolution_image, action_reason } = req.body;

        const existingTicket = await ticketRepositories.getTicketById(id);
        if (!existingTicket) throw new NotFoundError('Ticket tidak ditemukan');

        if (status === 'RESOLVED' && role === 'IT_STAFF') {
            if (String(existingTicket.assignee_id) !== String(userId)) {
                throw new InvariantError('Akses ditolak. Hanya teknisi yang ditugaskan yang dapat menyelesaikan tiket ini.');
            }
        }

        if (status === 'IN_PROGRESS' && role === 'IT_STAFF') {
            if (existingTicket.status === 'OPEN') {
                if (req.user.specialization && String(req.user.specialization).toUpperCase() !== String(existingTicket.category).toUpperCase()) {
                    throw new InvariantError('Akses ditolak. Kategori tiket di luar batas keahlian Anda.');
                }
            } else if (existingTicket.status === 'PENDING') {
                if (String(existingTicket.assignee_id) !== String(userId)) {
                    throw new InvariantError('Akses ditolak. Hanya teknisi yang ditugaskan yang dapat melanjutkan tiket ini.');
                }
            }
        }

        if (status === 'REJECTED' || status === 'PENDING') {
            if (!action_reason) {
                throw new InvariantError('Alasan penolakan atau penundaan (action_reason) wajib diisi.');
            }
            if (role === 'SUPERADMIN' || role === 'ADMIN') {
                if (existingTicket.status !== 'OPEN') {
                    throw new InvariantError(`Akses ditolak. Superadmin hanya dapat melakukan ${status} pada tiket dengan status OPEN.`);
                }
            } else if (role === 'IT_STAFF') {
                if (existingTicket.status !== 'IN_PROGRESS' && existingTicket.status !== 'RE-OPENED') {
                    throw new InvariantError(`Akses ditolak. Teknisi hanya dapat melakukan ${status} pada tiket dengan status IN_PROGRESS atau RE-OPENED.`);
                }
                if (String(existingTicket.assignee_id) !== String(userId)) {
                    throw new InvariantError(`Akses ditolak. Hanya teknisi yang ditugaskan yang dapat melakukan ${status} pada tiket ini.`);
                }
            }
        }

        let assignedId = userId;
        if (role === 'SUPERADMIN' || role === 'ADMIN') {
             // For Admin/Superadmin updating status directly (like Reject on OPEN), they don't become the assignee.
             assignedId = existingTicket.assignee_id; 
        }

        const ticket = await ticketRepositories.updateTicketStatus(id, status, assignedId, resolution_notes, resolution_image, action_reason);

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
        const { assignee_id, assignment_note_user, assignment_note_tech } = req.body;
        const assigner_id = req.user.id;

        fs.writeFileSync('assign-debug.log', JSON.stringify({ body: req.body, time: new Date() }) + '\n', { flag: 'a' });
        console.log('Backend assignTicket req.body:', req.body);

        if (!assignee_id) {
            throw new InvariantError('Technician ID (assignee_id) harus disertakan');
        }
        if (!assignment_note_user) {
            throw new InvariantError('Catatan untuk pelapor (assignment_note_user) harus disertakan');
        }

        const ticket = await ticketRepositories.assignTicket(id, assignee_id, assigner_id, assignment_note_user, assignment_note_tech || null);

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
        const { assignment_note_user } = req.body;

        if (!assignment_note_user) {
            throw new InvariantError('Catatan untuk pelapor (assignment_note_user) harus disertakan');
        }

        const existingTicket = await ticketRepositories.getTicketById(id);
        if (!existingTicket) throw new NotFoundError('Ticket tidak ditemukan');

        if (existingTicket.status !== 'OPEN') {
            throw new InvariantError('Tiket tidak dapat diklaim karena statusnya bukan OPEN.');
        }

        if (existingTicket.category !== userSpecialization) {
            throw new InvariantError('Kategori tiket tidak sesuai dengan spesialisasi Anda.');
        }

        const ticket = await ticketRepositories.assignTicket(id, userId, userId, assignment_note_user, null);

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

// Sesuai flowchart: Pelapor membatalkan tiket (Status: CANCELLED) karena "Kendala hilang".
// Hanya dapat dilakukan oleh pembuat tiket saat status OPEN atau IN_PROGRESS.
const CANCELLABLE_STATUSES = ['OPEN', 'IN_PROGRESS'];

export const cancelTicket = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { cancel_reason } = req.validated;
        const userId = req.user.id;

        const existingTicket = await ticketRepositories.getTicketById(id);
        if (!existingTicket) throw new NotFoundError('Ticket not found');

        if (String(existingTicket.reporter_id) !== String(userId)) {
            throw new InvariantError('Access denied. Only the ticket reporter can cancel this ticket.');
        }

        if (!CANCELLABLE_STATUSES.includes(existingTicket.status)) {
            throw new InvariantError(`Tickets with status ${existingTicket.status} cannot be cancelled. Cancellation is only allowed for OPEN or IN_PROGRESS tickets.`);
        }

        const ticket = await ticketRepositories.cancelTicket(id, cancel_reason);

        return response(res, 200, 'Ticket successfully cancelled', { ticket });
    } catch (err) {
        return next(err);
    }
}