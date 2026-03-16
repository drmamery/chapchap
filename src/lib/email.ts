import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://chapchap.ci';
const FROM = process.env.EMAIL_FROM || 'ChapChap <noreply@chapchap.ci>';

function emailWrapper(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #FFF7F3; color: #1A1A2E; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #FF6B2C, #FF9A56); border-radius: 16px 16px 0 0; padding: 32px; text-align: center; }
    .logo { font-size: 32px; font-weight: 900; color: white; letter-spacing: -1px; }
    .logo span { color: #FFD700; }
    .body { background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .btn { display: inline-block; background: #FF6B2C; color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; margin: 20px 0; }
    .info-box { background: #FFF7F3; border-left: 4px solid #FF6B2C; padding: 16px; border-radius: 8px; margin: 16px 0; }
    .table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .table th { text-align: left; padding: 10px; background: #F3F4F6; font-size: 13px; color: #6B7280; }
    .table td { padding: 10px; border-bottom: 1px solid #F3F4F6; font-size: 14px; }
    .footer { text-align: center; padding: 24px; color: #6B7280; font-size: 12px; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    h2 { font-size: 20px; margin: 20px 0 12px; color: #FF6B2C; }
    p { line-height: 1.6; margin: 8px 0; }
    .amount { font-size: 28px; font-weight: 900; color: #FF6B2C; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">Chap<span>Chap</span></div>
    <p style="color: rgba(255,255,255,0.8); margin-top: 8px; font-size: 14px;">La marketplace de Bouaké</p>
  </div>
  <div class="body">
    ${content}
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} ChapChap CI — Bouaké, Côte d'Ivoire</p>
    <p style="margin-top: 8px;">
      <a href="${SITE_URL}" style="color: #FF6B2C;">chapchap.ci</a> · 
      <a href="${SITE_URL}/help" style="color: #6B7280;">Aide</a> · 
      <a href="${SITE_URL}/privacy" style="color: #6B7280;">Confidentialité</a>
    </p>
    <p style="margin-top: 8px; font-size: 11px; color: #9CA3AF;">
      Vous recevez cet email car vous avez un compte ChapChap.
    </p>
  </div>
</div>
</body>
</html>`;
}

// Email de vérification
export async function sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
  const verifyUrl = `${SITE_URL}/auth/verify?token=${token}`;
  const html = emailWrapper(`
    <h1>Bienvenue sur ChapChap, ${name} ! 👋</h1>
    <p>Merci de vous être inscrit(e). Pour activer votre compte, veuillez confirmer votre adresse email.</p>
    <div style="text-align: center;">
      <a href="${verifyUrl}" class="btn">✅ Confirmer mon email</a>
    </div>
    <div class="info-box">
      <p><strong>⏰ Ce lien expire dans 24 heures.</strong></p>
      <p>Si vous n'avez pas créé de compte ChapChap, ignorez cet email.</p>
    </div>
    <p style="color: #6B7280; font-size: 13px;">Ou copiez ce lien dans votre navigateur :<br>
    <span style="color: #FF6B2C;">${verifyUrl}</span></p>
  `, 'Confirmez votre email ChapChap');

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: '✅ Confirmez votre email ChapChap',
    html,
  });
}

// Email de confirmation de commande
export async function sendOrderConfirmationEmail(email: string, name: string, order: any): Promise<void> {
  const orderUrl = `${SITE_URL}/buyer/orders/${order.id}`;
  const amount = new Intl.NumberFormat('fr-CI').format(order.total_price);
  
  const html = emailWrapper(`
    <h1>Commande confirmée ! 🎉</h1>
    <p>Bonjour ${name},</p>
    <p>Votre commande a bien été reçue. Le vendeur va la préparer sous peu.</p>
    
    <div style="text-align: center; padding: 24px 0;">
      <div class="amount">${amount} FCFA</div>
      <div style="color: #6B7280; margin-top: 4px;">Numéro de commande : <strong style="color: #1A1A2E;">${order.order_number}</strong></div>
    </div>

    <h2>📦 Détails de la commande</h2>
    <table class="table">
      <tr><th>Statut</th><td><span class="status-badge" style="background: #FEF3C7; color: #92400E;">En attente</span></td></tr>
      <tr><th>Méthode de paiement</th><td>${order.payment_method?.replace('_', ' ').toUpperCase() || 'Non défini'}</td></tr>
      <tr><th>Adresse de livraison</th><td>${order.shipping_address?.address || ''}, ${order.shipping_address?.city || 'Bouaké'}</td></tr>
      <tr><th>Livraison estimée</th><td>24-48 heures ouvrables</td></tr>
    </table>

    <div class="info-box">
      <p>🔍 <strong>Code de suivi :</strong> <strong style="color: #FF6B2C; font-family: monospace;">${order.tracking_code}</strong></p>
      <p>Utilisez ce code pour suivre votre commande en temps réel.</p>
    </div>

    <div style="text-align: center;">
      <a href="${orderUrl}" class="btn">📦 Suivre ma commande</a>
    </div>

    <p style="color: #6B7280; font-size: 13px; margin-top: 20px;">
      Des questions ? Contactez-nous via le chat ChapChap ou écrivez-nous à support@chapchap.ci
    </p>
  `, 'Commande confirmée');

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `✅ Commande ${order.order_number} confirmée — ChapChap`,
    html,
  });
}

// Email statut commande mis à jour
export async function sendOrderStatusEmail(email: string, name: string, order: any, newStatus: string): Promise<void> {
  const statusMessages: Record<string, { emoji: string; title: string; message: string }> = {
    confirmed: { emoji: '✅', title: 'Commande confirmée', message: 'Le vendeur a confirmé votre commande et commence la préparation.' },
    preparing: { emoji: '📦', title: 'En cours de préparation', message: 'Votre commande est en cours de préparation par le vendeur.' },
    shipped: { emoji: '🚚', title: 'Commande expédiée !', message: 'Votre commande est en route. Le livreur vous contactera bientôt.' },
    delivered: { emoji: '🎉', title: 'Commande livrée !', message: 'Votre commande a été livrée. Profitez de vos achats !' },
    cancelled: { emoji: '❌', title: 'Commande annulée', message: 'Votre commande a été annulée. Si vous avez déjà payé, le remboursement sera effectué sous 3-5 jours.' },
  };

  const config = statusMessages[newStatus] || { emoji: '📋', title: 'Mise à jour commande', message: 'Le statut de votre commande a été mis à jour.' };
  const orderUrl = `${SITE_URL}/buyer/orders/${order.id}`;

  const html = emailWrapper(`
    <h1>${config.emoji} ${config.title}</h1>
    <p>Bonjour ${name},</p>
    <p>${config.message}</p>
    
    <div class="info-box">
      <p><strong>Commande :</strong> ${order.order_number}</p>
      <p><strong>Nouveau statut :</strong> ${config.title}</p>
      ${order.tracking_code ? `<p><strong>Code de suivi :</strong> <span style="font-family: monospace; color: #FF6B2C;">${order.tracking_code}</span></p>` : ''}
    </div>

    <div style="text-align: center;">
      <a href="${orderUrl}" class="btn">Voir ma commande</a>
    </div>
  `, `Commande ${order.order_number} : ${config.title}`);

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `${config.emoji} ${config.title} — Commande ${order.order_number}`,
    html,
  });
}

// Email réinitialisation mot de passe
export async function sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
  const resetUrl = `${SITE_URL}/auth/reset-password?token=${token}`;
  
  const html = emailWrapper(`
    <h1>Réinitialisation de mot de passe 🔐</h1>
    <p>Bonjour ${name},</p>
    <p>Vous avez demandé à réinitialiser votre mot de passe ChapChap. Cliquez sur le bouton ci-dessous.</p>
    
    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn">🔑 Réinitialiser mon mot de passe</a>
    </div>

    <div class="info-box">
      <p>⏰ <strong>Ce lien expire dans 1 heure.</strong></p>
      <p>Si vous n'avez pas demandé de réinitialisation, ignorez cet email et votre mot de passe restera inchangé.</p>
    </div>
  `, 'Réinitialisation de mot de passe');

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: '🔑 Réinitialisation de votre mot de passe ChapChap',
    html,
  });
}

// Email alerte sécurité admin
export async function sendSecurityAlertEmail(adminEmail: string, alert: {
  type: string;
  message: string;
  ip?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  const html = emailWrapper(`
    <h1>⚠️ Alerte de Sécurité ChapChap</h1>
    <p>Une activité suspecte a été détectée sur votre plateforme ChapChap.</p>
    
    <div class="info-box" style="border-color: #EF4444; background: #FEF2F2;">
      <p><strong>Type :</strong> ${alert.type}</p>
      <p><strong>Message :</strong> ${alert.message}</p>
      ${alert.ip ? `<p><strong>Adresse IP :</strong> ${alert.ip}</p>` : ''}
      <p><strong>Date :</strong> ${new Date().toLocaleString('fr-CI')}</p>
    </div>

    <div style="text-align: center;">
      <a href="${SITE_URL}/admin/security" class="btn" style="background: #EF4444;">Voir les logs de sécurité</a>
    </div>
  `, 'Alerte de Sécurité');

  await transporter.sendMail({
    from: FROM,
    to: adminEmail,
    subject: `🚨 Alerte Sécurité ChapChap — ${alert.type}`,
    html,
  });
}
