import 'dotenv/config';
import server from './server/server.js';

const port = process.env.PORT || 5000;

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});