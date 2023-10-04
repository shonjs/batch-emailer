export type EmailMessage = {
  jobId: number;
  to: string;
  from: string;
  replyTo: string;
  body: string;
  subject: string;
};
