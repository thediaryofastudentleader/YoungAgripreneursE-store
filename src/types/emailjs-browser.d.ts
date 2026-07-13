declare module '@emailjs/browser' {
  interface EmailJSResponseStatus {
    status: number;
    text: string;
  }

  function init(publicKey: string, origin?: string): void;
  function send(
    serviceID: string,
    templateID: string,
    templateParams: Record<string, unknown>,
    options?: { publicKey?: string; privateKey?: string }
  ): Promise<EmailJSResponseStatus>;
  function sendForm(
    serviceID: string,
    templateID: string,
    form: string | HTMLFormElement,
    options?: { publicKey?: string; privateKey?: string }
  ): Promise<EmailJSResponseStatus>;

  export default {
    init,
    send,
    sendForm,
  };
  export { init, send, sendForm, EmailJSResponseStatus };
}
