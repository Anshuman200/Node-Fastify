interface OtpTemplateParams {
    title: string;
    message: string;
    otp: string;
}

export const buildOtpTemplate = ({
    title,
    message,
    otp,
}: OtpTemplateParams) => {
    return `
  <div style="
    background: #f9fafb;
    padding: 40px 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  ">
    <div style="
      max-width: 480px;
      margin: auto;
      background: #ffffff;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    ">
      
      <h2 style="margin: 0 0 10px; color: #111827;">
        ${title}
      </h2>

      <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
        ${message}
      </p>

      <div style="
        background: #111827;
        color: #ffffff;
        text-align: center;
        font-size: 28px;
        letter-spacing: 8px;
        padding: 18px;
        border-radius: 10px;
        font-weight: bold;
      ">
        ${otp}
      </div>

      <p style="margin-top: 20px; font-size: 13px; color: #9ca3af;">
        This code will expire in <b>10 minutes</b>.
      </p>

      <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;" />

      <p style="font-size: 12px; color: #9ca3af;">
        If you didn’t request this, you can safely ignore this email.
      </p>

    </div>

    <p style="text-align:center; font-size:12px; color:#9ca3af; margin-top:20px;">
      © ${new Date().getFullYear()} Learn App
    </p>
  </div>
  `;
};