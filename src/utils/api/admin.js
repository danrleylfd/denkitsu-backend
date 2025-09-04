const api = require("../../services/api")

const makeAdminApiCall = async (endpoint, user) => {
  try {
    console.log(`[ADMIN_TOOL] Chamando endpoint '${endpoint}' para o usuário ${user.name}`)
    const { data } = await api.post(
      `/admin/${endpoint}`,
      { email: user.email },
      { headers: { "X-Internal-API-Key": process.env.INTERNAL_API_KEY } }
    )
    return { status: 200, data }
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || `Erro ao chamar o endpoint '${endpoint}'.`
    console.error(`[ADMIN_TOOL] Erro em ${endpoint}:`, errorMessage)
    return { status: error.response?.status || 500, data: { error: errorMessage } }
  }
}

const cancelSubscription = (user) => makeAdminApiCall("cancel-subscription", user)
const refundSubscription = (user) => makeAdminApiCall("refund-subscription", user)
const reactivateSubscription = (user) => makeAdminApiCall("reactivate-subscription", user)

const cancelSubscriptionTool = {
  type: "function",
  function: {
    name: "cancelSubscriptionTool",
    description: "Agenda o cancelamento da assinatura do usuário AUTENTICADO para o final do período de faturamento atual.",
    parameters: { type: "object", properties: {}, required: [] }
  }
}

const refundSubscriptionTool = {
  type: "function",
  function: {
    name: "refundSubscriptionTool",
    description: "Tenta reembolsar a última cobrança do usuário AUTENTICADO (se dentro da política de 7 dias) e agenda o cancelamento da assinatura.",
    parameters: { type: "object", properties: {}, required: [] }
  }
}

const reactivateSubscriptionTool = {
  type: "function",
  function: {
    name: "reactivateSubscriptionTool",
    description: "Remove o agendamento de cancelamento de uma assinatura do usuário AUTENTICADO, reativando-a efetivamente.",
    parameters: { type: "object", properties: {}, required: [] }
  }
}

const checkAndSyncSubscription = async (user) => {
  try {
    console.log(`[SUPPORT_TOOL] Verificando e sincronizando assinatura para ${user.name}`)
    const { data } = await api.post(
      "/admin/sync-subscription",
      { email: user.email },
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
  cancelSubscription,
  refundSubscription,
  reactivateSubscription,
  cancelSubscriptionTool,
  refundSubscriptionTool,
  reactivateSubscriptionTool,
  checkAndSyncSubscription,
  checkAndSyncSubscriptionTool
}
