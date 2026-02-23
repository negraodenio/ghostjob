import { Resend } from 'resend';

// Lazy singleton - only throws at request time, not build time
let _resend: Resend | null = null;

function getResend(): Resend {
    if (!_resend) {
        const key = process.env.RESEND_API_KEY;
        if (!key) throw new Error('Missing RESEND_API_KEY environment variable');
        _resend = new Resend(key);
    }
    return _resend;
}

// Proxy that matches the Resend client interface used in routes
export const resend = {
    emails: {
        send: (payload: Parameters<Resend['emails']['send']>[0]) =>
            getResend().emails.send(payload),
    },
};
