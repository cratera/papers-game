import Device from 'expo-device'
import { composeAsync } from 'expo-mail-composer'
import config from '../../app.config'

const { version } = config

const contactEmails = {
  sandrina: 'a.sandrina.p@gmail.com',
}

// TODO: update before release
export const requestFeedback = async () => {
  const template = {
    recipients: [contactEmails.sandrina],
    subject: 'Papers - Feedback',
    body:
      '\n' +
      '\n' +
      '\n' +
      '- - - - - - - - - - - - -' +
      '\n' +
      `V. ${version} - ${Device.osName} ${Device.modelName}` +
      '\n' +
      '- - - - - - - - - - - - -',
  }
  return await composeAsync(template)
}

export const requestBugReport = async () => {
  const template = {
    recipients: [contactEmails.sandrina],
    subject: 'Papers - Bug',
    body:
      '\n' +
      '\n' +
      '\n' +
      '- - - - - - - - - - - - -' +
      '\n' +
      `V. ${version} - ${Device.osName} ${Device.modelName}` +
      '\n' +
      '- - - - - - - - - - - - -',
  }
  return await composeAsync(template)
}
