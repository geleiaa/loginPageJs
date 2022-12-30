const nodemailer = require('nodemailer');

// server de email com mailtrap

const sendEmail = async options => {
    // cria o transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASS
        }
    });

// conteudo do email
const mailOptions = {
    from: 'Geleiaa <geleia@geleia.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
}

    // manda o email 
    await transporter.sendMail(mailOptions);

};

module.exports = sendEmail;