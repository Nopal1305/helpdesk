import ticketRepositories from "../repositories/ticket-repositories.js";
import response from "../../../utils/response.js";
import InvariantError from "../../../exceptions/invariant-error.js";

export const addTicket = async (req, res, next) => {
    try {
        const { title, category, priority, description } = req.validated;
        const reporter_id = req.user.id;

        const ticket = await ticketRepositories.addTicket({
            title, category, priority, description, reporter_id
        })

        if (!ticket) {
            throw new InvariantError('Ticket gagal ditambahkan')
        }

        return response(res, 201, "Ticket berhasil ditambahkan", { ticket })

    } catch (error) {
        return next(error);
    }
}

export const getTickets = async (req, res, next) => {
    try {
        const reporter_id = req.user.id;
        const role = req.user.role;

        let tickets;
        if (role === 'IT_STAFF') {
            tickets = await ticketRepositories.getAllTicket();
        } else {
            tickets = await ticketRepositories.getTicketsbyReporter(reporter_id);
        }

        return response(res, 200, 'Ticket berhasil ditampilkan', { tickets })
    } catch (err) {
        return next(err)
    }
}

export const updateTicketStatus = async (req, res, next) => {
    try {
        const role = req.user.role;
        const userId = req.user.id;

        if (role !== 'IT_STAFF') {
            throw new InvariantError('Akses ditolak. Hanya IT Staff yang dapat mengubah status tiket.');
        }

        const { id } = req.params;
        const { status, resolution_notes } = req.body;

        const ticket = await ticketRepositories.updateTicketStatus(id, status, userId, resolution_notes);

        return response(res, 200, 'Ticket berhasil diperbarui', { ticket });

    } catch (err) {
        return next(err);
    }
}