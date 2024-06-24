// export const environment = {
//     stripePublicKey:'pk_test_51PLjvnRvOeoPHU1weSASxnNhkZFs1Lbe2DbSVoT1enRVzrJKRjH2OCCCL9F09sZcTB1bq43QL80zb3vdolC75pF500Zgvg7oCU',
//     apiUrl: `13.201.61.84`
    
// };
const PORT = 3000
const IP = `13.233.196.53`
// const IP = 'localhost'

export const environment = {
    stripePublicKey:'pk_test_51PLjvnRvOeoPHU1weSASxnNhkZFs1Lbe2DbSVoT1enRVzrJKRjH2OCCCL9F09sZcTB1bq43QL80zb3vdolC75pF500Zgvg7oCU',
    PORT: PORT,
    apiUrl: `http://${IP}:${PORT}`,
    // apiUrl: `http://${IP}:${PORT}`,
};