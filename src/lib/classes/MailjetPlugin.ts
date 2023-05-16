import { MailjetAttachment } from '../interfaces/MailjetAttachment'
import { MailjetPluginOptions } from '../interfaces/MailjetPluginOptions'
import { Client, SendEmailV3_1, LibraryResponse } from 'node-mailjet'

export function MailjetPlugin (
  schema: any,
  options: Partial<MailjetPluginOptions>
): void {
  const conf: MailjetPluginOptions = {
    emailField: 'email',
    firstnameField: 'firstname',
    lastnameField: 'lastname',
    apiKey: null,
    apiSecret: null,
    fromName: null,
    fromEmail: null,
    ...options
  }

  if (conf.apiKey === null) throw new Error('API key is not defined')
  if (conf.apiSecret === null) throw new Error('API secret is not defined')
  if (conf.fromName === null) throw new Error('Sender name is not defined')
  if (conf.fromEmail === null) throw new Error('Sender email is not defined')

  const mj = new Client({
    apiKey: conf.apiKey,
    apiSecret: conf.apiSecret
  })

  schema.method(
    'sendEmail',
    async function sendEmail (
      subject: string,
      html: string,
      attachments: MailjetAttachment[] = []
    ) {
      const data: SendEmailV3_1.Body = {
        Messages: [
          {
            From: {
              Email: conf.fromEmail as string,
              Name: conf.fromName as string
            },
            To: [
              {
                Name: `${this[conf.firstnameField]} ${
                  this[conf.lastnameField]
                }`.trim(),
                Email: this[conf.emailField]
              }
            ],
            Subject: subject,
            HTMLPart: html,
            Attachments: attachments.map((a: MailjetAttachment) => ({
              Filename: a.filename,
              Base64Content: a.base64Content,
              ContentType: a.mimeType
            }))
          }
        ]
      }

      const result: LibraryResponse<SendEmailV3_1.Response> = await mj
        .post('send', { version: 'v3.1' })
        .request(data)

      const { Status } = result.body.Messages[0]
      return Status === 'success'
    }
  )

  schema.method(
    'sendEmailTemplate',
    async function sendEmailTemplate (
      subject: string,
      templateId: number,
      variables: any = {},
      attachments: MailjetAttachment[] = []
    ) {
      const data: SendEmailV3_1.Body = {
        Messages: [
          {
            From: {
              Email: conf.fromEmail as string,
              Name: conf.fromName as string
            },
            To: [
              {
                Name: `${this[conf.firstnameField]} ${
                  this[conf.lastnameField]
                }`.trim(),
                Email: this[conf.emailField]
              }
            ],
            Subject: subject,
            TemplateLanguage: true,
            TemplateID: templateId,
            Variables: variables,
            Attachments: attachments.map((a: MailjetAttachment) => ({
              Filename: a.filename,
              Base64Content: a.base64Content,
              ContentType: a.mimeType
            }))
          }
        ]
      }

      const result: LibraryResponse<SendEmailV3_1.Response> = await mj
        .post('send', { version: 'v3.1' })
        .request(data)

      const { Status } = result.body.Messages[0]
      return Status === 'success'
    }
  )
}
