export type EmailMessage = {
  jobId: number;
  to: string;
  from: string;
  replyTo: string;
  text: string;
  html?: string;
  subject: string;
};
