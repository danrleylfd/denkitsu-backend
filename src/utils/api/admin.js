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
    description: "Gerencia a assinatura do usuário AUTENTICADO. A ação 'cancel' agenda o cancelamento para o fim do período. A ação 'refund' tenta reembolsar a última cobrança (se dentro da política de 7 dias) E também agenda o cancelamento.",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          description: "A ação específica a ser executada: 'cancel' ou 'refund'.",
          enum: ["cancel", "refund"]
        }
      },
      required: ["action"]
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
    description: "Verifica e sincroniza o status da assinatura do usuário AUTENTICADO com o provedor de pagamentos. Use quando um usuário alega ter pago mas ainda está no plano free.",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  }
}

module.exports = {
  manageSubscription,
  manageSubscriptionTool,
  checkAndSyncSubscription,
  checkAndSyncSubscriptionTool
}
