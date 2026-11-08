<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Retrieve Account - Password Reset OTP</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f5f7;
            margin: 0;
            padding: 0;
            color: #333333;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            background-color: #f4f5f7;
            padding: 30px 15px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            border: 1px solid #e2e8f0;
        }
        .header {
            background-color: #800000;
            padding: 32px 24px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 0.5px;
        }
        .header p {
            margin: 6px 0 0 0;
            font-size: 13px;
            opacity: 0.9;
            letter-spacing: 0.5px;
        }
        .content {
            padding: 32px 28px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 14px;
            color: #1e293b;
        }
        .message {
            font-size: 15px;
            line-height: 1.6;
            color: #475569;
            margin-bottom: 24px;
        }
        .otp-box {
            background-color: #fdf2f2;
            border: 2px dashed #800000;
            border-radius: 14px;
            padding: 24px;
            text-align: center;
            margin: 24px 0;
        }
        .otp-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #800000;
            font-weight: 800;
            margin-bottom: 8px;
        }
        .otp-code {
            font-size: 38px;
            font-weight: 900;
            letter-spacing: 10px;
            color: #800000;
            font-family: 'Courier New', Courier, monospace;
            padding-left: 10px;
        }
        .otp-expiry {
            font-size: 12.5px;
            color: #64748b;
            margin-top: 10px;
            font-weight: 600;
        }
        .security-notice {
            background-color: #f8fafc;
            border-left: 4px solid #800000;
            padding: 14px 16px;
            border-radius: 0 8px 8px 0;
            font-size: 13px;
            color: #64748b;
            line-height: 1.5;
            margin-top: 24px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 22px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>Mindanao State University</h1>
                <p>MSU Job Portal &bull; Account Recovery & Password Reset</p>
            </div>
            <div class="content">
                <div class="greeting">Hello, {{ $userName }}!</div>
                <div class="message">
                    We received a request to reset your password and retrieve your account on the MSU Job Portal. Please use the following One-Time Password (OTP) code to verify your identity and set a new password:
                </div>

                <div class="otp-box">
                    <div class="otp-label">Password Reset Code (OTP)</div>
                    <div class="otp-code">{{ $otpCode }}</div>
                    <div class="otp-expiry">&#9200; Valid for 10 minutes only</div>
                </div>

                <div class="security-notice">
                    <strong>Security reminder:</strong> If you did not request a password reset, you can safely ignore this email. Your current password remains active and secure.
                </div>
            </div>
            <div class="footer">
                &copy; {{ date('Y') }} Mindanao State University Job Portal. All rights reserved.<br>
                This is an automated system email. Please do not reply directly to this message.
            </div>
        </div>
    </div>
</body>
</html>

