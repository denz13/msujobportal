<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $status === 'approved' ? 'Application Approved' : 'Application Declined' }}</title>
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
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: #800000; /* MSU Maroon */
            padding: 28px 24px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .header p {
            margin: 6px 0 0 0;
            font-size: 13px;
            opacity: 0.9;
        }
        .content {
            padding: 32px 28px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #1a1a1a;
        }
        .badge-box {
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            display: flex;
            align-items: center;
        }
        .badge-approved {
            background-color: #ecfdf5;
            border-left: 4px solid #10b981;
            color: #065f46;
        }
        .badge-declined {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            color: #991b1b;
        }
        .badge-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 4px;
        }
        .badge-desc {
            font-size: 14px;
            margin: 0;
            line-height: 1.5;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0;
            background-color: #fafafa;
            border-radius: 8px;
            overflow: hidden;
        }
        .details-table td {
            padding: 12px 16px;
            border-bottom: 1px solid #eeeeee;
            font-size: 14px;
        }
        .details-table td:first-child {
            font-weight: 600;
            color: #666666;
            width: 35%;
        }
        .details-table td:last-child {
            color: #222222;
        }
        .details-table tr:last-child td {
            border-bottom: none;
        }
        .remarks-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px 16px;
            margin: 18px 0;
        }
        .remarks-label {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            margin-bottom: 6px;
        }
        .remarks-text {
            font-size: 14px;
            color: #334155;
            margin: 0;
            white-space: pre-wrap;
            line-height: 1.5;
        }
        .btn-wrapper {
            text-align: center;
            margin: 30px 0 10px 0;
        }
        .btn {
            display: inline-block;
            background-color: #800000;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #888888;
            border-top: 1px solid #edf2f7;
        }
        .footer p {
            margin: 4px 0;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>MSU Job Portal</h1>
                <p>Mindanao State University Job Placement & Application System</p>
            </div>
            <div class="content">
                <div class="greeting">
                    Hello, {{ $applicantName }}!
                </div>

                @if($status === 'approved')
                    <div class="badge-box badge-approved">
                        <div>
                            <div class="badge-title">🎉 Application Approved!</div>
                            <div class="badge-desc">
                                We are pleased to inform you that your job application has been <strong>approved</strong> by the employer.
                            </div>
                        </div>
                    </div>
                    <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
                        The employer may reach out to you directly for the next steps in the recruitment and onboarding process. You can also view more information by accessing your portal account.
                    </p>
                @else
                    <div class="badge-box badge-declined">
                        <div>
                            <div class="badge-title">Application Status Update</div>
                            <div class="badge-desc">
                                Thank you for your interest. After review, your application for this position has been <strong>declined</strong>.
                            </div>
                        </div>
                    </div>
                    <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
                        We appreciate the time you took to apply. We encourage you to continue browsing and applying for other open opportunities on the MSU Job Portal.
                    </p>
                @endif

                <table class="details-table">
                    <tr>
                        <td>Position Applied</td>
                        <td><strong>{{ $jobTitle }}</strong></td>
                    </tr>
                    @if(!empty($employerName))
                    <tr>
                        <td>Employer / Office</td>
                        <td>{{ $employerName }}</td>
                    </tr>
                    @endif
                    <tr>
                        <td>Status</td>
                        <td>
                            @if($status === 'approved')
                                <span style="color: #059669; font-weight: 600;">Approved</span>
                            @else
                                <span style="color: #dc2626; font-weight: 600;">Declined</span>
                            @endif
                        </td>
                    </tr>
                </table>

                @if(!empty($remarks))
                    <div class="remarks-box">
                        <div class="remarks-label">Remarks / Note from Employer:</div>
                        <p class="remarks-text">{{ $remarks }}</p>
                    </div>
                @endif
            </div>
            <div class="footer">
                <p>This is an automated notification from the <strong>MSU Job Portal</strong>.</p>
                <p>Please do not reply directly to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>
