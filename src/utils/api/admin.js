const api = require("../../services/api")

const checkAndSyncSubscription = async ({ email }) => {
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

const manageSubscription = async ({ email, action }) => {
   try {
    console.log(`[ADMIN_TOOL] Executando ação '${action}' para o usuário ${email}`)
    const { data } = await api.post(`/admin/manage-subscription`,
      { email },
      { headers: { "X-Internal-API-Key": process.env.INTERNAL_API_KEY } }
    )
    return { status: 200, data }
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || "Erro na ferramenta de gerenciamento."
    console.error("[ADMIN_TOOL] Erro:", errorMessage)
    return { status: error.response?.status || 500, data: { error: errorMessage } }
  }
}

const manageSubscriptionTool = {
  type: "function",
  function: {
    name: "manageSubscriptionTool",
    description: "Processa um reembolso para a última cobrança de um usuário E/OU cancela sua assinatura Pro, aplicando a política de reembolso de 7 dias.",
    parameters: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "O e-mail do usuário cuja assinatura deve ser gerenciada."
        },
        action: {
          type: "string",
          description: "A ação a ser executada. Atualmente, apenas 'refund_and_cancel' é suportada.",
          enum: ["refund_and_cancel"]
        }
      },
      required: ["email", "action"]
    }
  }
}

module.exports = {
  manageSubscription,
  manageSubscriptionTool,
  checkAndSyncSubscription,
  checkAndSyncSubscriptionTool
}
