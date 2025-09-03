const api = require("../../services/api")

const manageSubscription = async (action, email) => {
  try {
    console.log(`[ADMIN_TOOL] Executando ação '${action}' para o usuário ${email}`)
    const { data } = await api.post(`/admin/manage-subscription`,
      { email, action },
      { headers: { "X-Internal-API-Key": process.env.INTERNAL_API_KEY } }
    )
    return { status: 200, data }
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || `Erro ao executar a ação '${action}'.`
    console.error("[ADMIN_TOOL] Erro:", errorMessage)
    return { status: error.response?.status || 500, data: { error: errorMessage } }
  }
}

const manageSubscriptionTool = {
  type: "function",
  function: {
    name: "manageSubscriptionTool",
    description: "Gerencia a assinatura de um usuário. A ação 'cancel' apenas cancela cobranças futuras. A ação 'refund' tenta reembolsar a última cobrança (se dentro da política de 7 dias) E também cancela a assinatura.",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          description: "A ação específica a ser executada: 'cancel' ou 'refund'.",
          enum: ["cancel", "refund"]
        },
        email: {
          type: "string",
          description: "O e-mail do usuário cuja assinatura deve ser gerenciada."
        },
      },
      required: ["email", "action"]
    }
  }
}

const checkAndSyncSubscription = async (email) => {
  try {
    console.log(`[SUPPORT_TOOL] Verificando e sincronizando assinatura para ${email}`)
    const { data } = await api.post(`/admin/sync-subscription`,
      { email },
      { headers: { "X-Internal-API-Key": process.env.INTERNAL_API_KEY } }
    )
    return { status: 200, data }
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || "Erro na ferramenta de sincronização."
    console.error("[SUPPORT_TOOL] Erro:", errorMessage)
    return { status: error.response?.status || 500, data: { error: errorMessage } }
  }
}

const checkAndSyncSubscriptionTool = {
  type: "function",
  function: {
    name: "checkAndSyncSubscriptionTool",
    description: "Verifica o status real da assinatura de um cliente no Stripe e força a sincronização com o banco de dados local para garantir que o plano de acesso esteja correto. Use esta ferramenta quando um usuário alega ter pago mas ainda está no plano free.",
    parameters: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "O e-mail do usuário que precisa ter a conta sincronizada."
        }
      },
      required: ["email"]
    }
  }
}

module.exports = {
  manageSubscription,
  manageSubscriptionTool,
  checkAndSyncSubscription,
  checkAndSyncSubscriptionTool
}
