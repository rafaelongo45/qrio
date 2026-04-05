import { useEffect } from 'react'

export default function PrivacyPage() {
  useEffect(() => {
    document.title = 'Política de Privacidade — QRio'
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Política de Privacidade</h1>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-10">Última atualização: abril de 2025</p>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-gray-600 dark:text-gray-300">

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Sobre o QRio</h2>
          <p>
            O QRio é um serviço de geração de QR Codes desenvolvido para o mercado brasileiro.
            Esta política descreve como coletamos, usamos e protegemos suas informações ao utilizar nossa plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Dados coletados</h2>
          <p className="mb-3">Coletamos apenas os dados necessários para o funcionamento do serviço:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Dados de cadastro:</strong> endereço de e-mail e senha (armazenada de forma criptografada) ao criar uma conta.</li>
            <li><strong>QR Codes salvos:</strong> o conteúdo dos QR Codes que você salva na sua conta (URLs, chaves Pix, números de WhatsApp, etc.).</li>
            <li><strong>Dados de pagamento:</strong> registramos o status do pagamento (pendente ou confirmado) e o valor. Não armazenamos dados bancários ou de cartão.</li>
            <li><strong>Dados de uso dos QR Codes dinâmicos:</strong> para usuários Pro, registramos a data/hora e o dispositivo (user-agent) de cada escaneamento, sem identificar o usuário final.</li>
            <li><strong>Cookies de sessão:</strong> utilizamos um cookie seguro e criptografado para manter sua sessão ativa por até 30 dias.</li>
          </ul>
          <p className="mt-3">
            Usuários que utilizam o gerador sem criar conta <strong>não têm nenhum dado pessoal coletado</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Como usamos seus dados</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Autenticar o acesso à sua conta</li>
            <li>Salvar e exibir seus QR Codes no painel</li>
            <li>Processar e confirmar pagamentos do plano Pro</li>
            <li>Enviar e-mails transacionais (redefinição de senha)</li>
            <li>Exibir estatísticas de escaneamento para QR Codes dinâmicos</li>
          </ul>
          <p className="mt-3">Não utilizamos seus dados para fins publicitários ou os vendemos a terceiros.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Compartilhamento com terceiros</h2>
          <p className="mb-3">Para operar o serviço, utilizamos os seguintes provedores:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Render</strong> — hospedagem do servidor e banco de dados (infraestrutura)</li>
            <li><strong>Vercel</strong> — hospedagem do site</li>
            <li><strong>Resend</strong> — envio de e-mails transacionais (ex: redefinição de senha)</li>
          </ul>
          <p className="mt-3">Todos os provedores são contratualmente obrigados a proteger seus dados.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Segurança</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Senhas são armazenadas com hash criptográfico (bcrypt)</li>
            <li>Comunicações protegidas por HTTPS/TLS</li>
            <li>Tokens de sessão são rotativos e expiram automaticamente</li>
            <li>Acesso aos dados restrito por autenticação JWT</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Seus direitos</h2>
          <p className="mb-3">Em conformidade com a <strong>LGPD (Lei 13.709/2018)</strong>, você tem direito a:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Acessar os dados que armazenamos sobre você</li>
            <li>Corrigir dados incorretos</li>
            <li>Solicitar a exclusão da sua conta e de todos os seus dados</li>
            <li>Revogar o consentimento para uso dos seus dados</li>
          </ul>
          <p className="mt-3">
            Para exercer qualquer um desses direitos, entre em contato pelo e-mail abaixo.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Retenção de dados</h2>
          <p>
            Seus dados são mantidos enquanto sua conta estiver ativa. Ao solicitar a exclusão da conta,
            todos os dados associados são removidos permanentemente em até 30 dias.
            Logs de escaneamento de QR Codes são excluídos junto com o QR Code correspondente.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Cookies</h2>
          <p>
            Utilizamos apenas um cookie essencial para manter sua sessão ativa (<code className="text-sm bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">qrio_refresh</code>).
            Ele é <strong>httpOnly</strong> (não acessível por JavaScript), <strong>seguro</strong> (enviado apenas via HTTPS)
            e expira em 30 dias. Não utilizamos cookies de rastreamento ou publicidade.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Alterações nesta política</h2>
          <p>
            Podemos atualizar esta política periodicamente. Alterações significativas serão comunicadas
            por e-mail aos usuários cadastrados. A data da última atualização está sempre indicada no topo desta página.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10. Contato</h2>
          <p>
            Dúvidas sobre esta política ou sobre seus dados? Entre em contato:
          </p>
          <p className="mt-2">
            <strong>E-mail:</strong>{' '}
            <a href="mailto:contato@qrio.app" className="text-brand-600 dark:text-brand-400 hover:underline">
              contato@qrio.app
            </a>
          </p>
        </section>

      </div>
    </div>
  )
}
