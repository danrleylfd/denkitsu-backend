const api = require("../../app/services/api")

const makeAdminApiCall = async ({ endpoint, user }) => {
  try {
    console.log(`[ADMIN_TOOL] Chamando endpoint '${endpoint}' para o usuário ${user.name}`)
    const { data } = await api.post(
      `/admin/${endpoint}`,
      { user },
      { headers: { "X-Internal-API-Key": process.env.INTERNAL_API_KEY } }
    )
    return { status: 200, data }
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || `Erro ao chamar o endpoint '${endpoint}'.`
    console.error(`[ADMIN_TOOL] Erro em ${endpoint}:`, errorMessage)
    return { status: error.response?.status || 500, data: { error: errorMessage } }
  }
}

const cancelSubscription = (user) => makeAdminApiCall({ endpoint: "cancel-subscription", user })
const refundSubscription = (user) => makeAdminApiCall({ endpoint: "refund-subscription", user })
const reactivateSubscription = (user) => makeAdminApiCall({ endpoint: "reactivate-subscription", user })
const syncSubscription = (user) => makeAdminApiCall({ endpoint: "sync-subscription", user })

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

const syncSubscriptionTool = {
  type: "function",
  function: {
    name: "syncSubscriptionTool",
    description: "Verifica e sincroniza o status da assinatura do usuário AUTENTICADO com o provedor de pagamentos. Use quando um usuário alega ter pago mas ainda está no plano free.",
    parameters: { type: "object", properties: {}, required: [] }
  }
}

module.exports = {
  cancelSubscription,
  refundSubscription,
  reactivateSubscription,
  cancelSubscriptionTool,
  refundSubscriptionTool,
  reactivateSubscriptionTool,
  syncSubscription,
  syncSubscriptionTool
}
