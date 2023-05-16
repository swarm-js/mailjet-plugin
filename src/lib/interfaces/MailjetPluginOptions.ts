export interface MailjetPluginOptions {
  emailField: string
  firstnameField: string
  lastnameField: string
  apiKey: string | null
  apiSecret: string | null
  fromName: string | null
  fromEmail: string | null
}
