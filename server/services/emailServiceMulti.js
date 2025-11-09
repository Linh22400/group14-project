const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const mailgun = require('mailgun-js');
const emailjs = require('@emailjs/nodejs');

// Cấu hình các providers
const providers = {
  sendgrid: {
    name: 'SendGrid',
    enabled: false,
    priority: 1,
    config: null
  },
  mailgun: {
    name: 'Mailgun', 
    enabled: false,
    priority: 2,
    config: null
  },
  emailjs: {
    name: 'EmailJS',
    enabled: false, 
    priority: 3,
    config: null
  },
  smtp: {
    name: 'Gmail SMTP',
    enabled: true,
    priority: 4,
    config: null
  }
};

// Khởi tạo SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  providers.sendgrid.enabled = true;
  providers.sendgrid.config = sgMail;
}

// Khởi tạo Mailgun
if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
  providers.mailgun.enabled = true;
  providers.mailgun.config = mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  });
}

// Khởi tạo EmailJS
if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID) {
  providers.emailjs.enabled = true;
  providers.emailjs.config = {
    serviceID: process.env.EMAILJS_SERVICE_ID,
    templateID: process.env.EMAILJS_TEMPLATE_ID,
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY
  };
}

// Cấu hình Gmail SMTP fallback
const smtpTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000
});

providers.smtp.config = smtpTransporter;

// Hàm gửi email với auto-fallback
const sendEmailWithFallback = async (email, subject, html, text = null) => {
  const errors = [];
  
  // Sắp xếp providers theo priority
  const sortedProviders = Object.values(providers)
    .filter(p => p.enabled)
    .sort((a, b) => a.priority - b.priority);

  console.log(`📧 Đang thử gửi email qua ${sortedProviders.length} providers...`);

  for (const provider of sortedProviders) {
    try {
      console.log(`🔄 Thử gửi qua ${provider.name}...`);
      
      let result;
      
      switch (provider.name) {
        case 'SendGrid':
          const msg = {
            to: email,
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            subject: subject,
            html: html,
            text: text
          };
          result = await sgMail.send(msg);
          break;

        case 'Mailgun':
          const mailgunData = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: html,
            text: text
          };
          result = await new Promise((resolve, reject) => {
            provider.config.messages().send(mailgunData, (error, body) => {
              if (error) reject(error);
              else resolve(body);
            });
          });
          break;

        case 'EmailJS':
          const emailjsData = {
            service_id: provider.config.serviceID,
            template_id: provider.config.templateID,
            template_params: {
              to_email: email,
              subject: subject,
              html_content: html,
              text_content: text
            },
            public_key: provider.config.publicKey,
            private_key: provider.config.privateKey
          };
          result = await emailjs.send(provider.config.serviceID, provider.config.templateID, emailjsData.template_params);
          break;

        case 'Gmail SMTP':
          const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: html,
            text: text
          };
          result = await smtpTransporter.sendMail(mailOptions);
          break;
      }

      console.log(`✅ Email gửi thành công qua ${provider.name}!`);
      return { success: true, provider: provider.name, result };
      
    } catch (error) {
      console.error(`❌ ${provider.name} thất bại:`, error.message);
      errors.push({ provider: provider.name, error: error.message });
      continue; // Thử provider tiếp theo
    }
  }

  // Tất cả providers đều thất bại
  throw new Error(`Tất cả email providers đều thất bại: ${errors.map(e => `${e.provider}: ${e.error}`).join(', ')}`);
};

// Send password reset email
const sendResetPasswordEmail = async (email, resetUrl) => {
  const subject = 'Đặt lại mật khẩu - Yêu cầu xác nhận';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h2 style="color: #333;">Đặt lại mật khẩu</h2>
      </div>
      <div style="padding: 30px; background-color: #ffffff;">
        <p>Xin chào,</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn vào nút bên dưới để tiếp tục:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #007bff; color: white; padding: 15px 30px; 
                    font-size: 16px; font-weight: bold; text-decoration: none; 
                    border-radius: 8px; display: inline-block;">
            Đặt lại mật khẩu
          </a>
        </div>
        <p style="text-align: center; color: #666; font-size: 14px;">
          Hoặc copy và paste link sau vào trình duyệt:
        </p>
        <p style="text-align: center; word-break: break-all; color: #007bff; font-size: 12px;">
          ${resetUrl}
        </p>
        <p><strong>Lưu ý:</strong> Link này sẽ hết hạn sau 1 giờ.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      </div>
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666;">
        <p>Email này được gửi tự động từ hệ thống.</p>
      </div>
    </div>
  `;

  return await sendEmailWithFallback(email, subject, html);
};

module.exports = { sendResetPasswordEmail, sendEmailWithFallback };