const { MercadoPagoConfig, Payment, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({
  accessToken: 'TEST-2058488789455694-120321-a260c22a9c7416692e07f283a9289c5c-259268948', // Substitua pelo seu Access Token
});

const paymentController = {
    // Criação de uma preferência
    createPreference: async (req, res) => {
        try {
            const { music, stared_at, message, plan, coupleName, email } = req.body;
    
            if (!music || !stared_at || !message || !plan || !coupleName || !email) {
            return res.status(400).json({
                error: "Os campos 'music', 'stared_at', 'message', 'plan', 'coupleName' e 'email' são obrigatórios.",
            });
            }
            const preference = new Preference(client);
            const response = await preference.create({
              body: {
                items: [
                  {
                    title: `Plano ${plan} - ${coupleName}`,
                    description: `Mensagem: ${message}\nInício: ${stared_at}\nMúsica: ${music}`,
                    unit_price: plan === 'premium' ? 200.0 : 100.0,
                    quantity: 1,
                  },
                ],
                payer: {
                  email,
                },
                back_urls: {
                  success: `${process.env.BASE_URL}/complete`,
                  failure: `${process.env.BASE_URL}/failure`,
                  pending: `${process.env.BASE_URL}/pending`,
                },
                auto_return: "approved",
              },
            });
            
            if (!response.id) {
              console.error("Resposta inesperada da API do Mercado Pago:", response);
              return res.status(500).json({
                error: "Erro ao criar preferência",
                details: "Resposta inesperada da API do Mercado Pago",
              });
            }
            
            res.status(200).json({
              id: response.id,
              init_point: response.init_point,
            });
            
        } catch (error) {
            console.error("Erro ao criar preferência:", error.response?.data || error.message);
            res.status(500).json({ error: "Erro ao criar preferência", details: error.response?.data || error.message });
        }
          
    },
    // Captura de notificações do Mercado Pago
    paymentNotification: (req, res) => {
        let secret_key = 'eaa2e79c309f51ddccd5b8918ce59718f15809ee47661f82d9520e55e52d6f04';
        try {
        console.log("Notificação recebida:", req.body);

        res.status(200).send("OK");
        } catch (error) {
        console.error("Erro ao processar notificação:", error);
        res.status(500).send("Erro ao processar notificação");
        }
    },

    // Criação de um pagamento direto
    createPayment: async (req, res) => {
        try {
        const payment = new Payment(client);

        const response = await payment.create({
            body: req.body, // O body deve conter as informações do pagamento
        });

        res.status(200).json(response.body);
        } catch (error) {
        console.error("Erro ao criar pagamento:", error);
        res.status(500).json({ error: "Erro ao criar pagamento" });
        }
    },

    completePayment: async (req, res) => {

      try {
        const { music, stared_at, message, plan, coupleName, email } = req.body;
        
      } catch {
        return "Erro, por favor entre em contato via WhatsApp no número +55 (47) 99698-8610";
      }

    }
};

module.exports = paymentController;