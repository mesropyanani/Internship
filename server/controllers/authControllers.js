const AuthSchema = require('../models/auth');
const axios = require('axios');
const token = process.env.TOKEN
const bot_id = process.env.BOT_ID
const telegramApiUrl = `https://api.telegram.org/bot${token}/sendMessage`;
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID; // Например, 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Например, 'your_auth_token'

const client = twilio(accountSid, authToken);
class AuthController {
  async postAuth(req, res) {
    try {

      let { number, name, desc, date, email, service } = req.body;
      if (!number) return res.status(401).json({ err: "полу number пуст" })
      const newAuth = new AuthSchema(req.body);
      newAuth.id = String(newAuth._id)
      await newAuth.save();
      if (date) {
        date = date.replace("T", " ")
      }
      let info = 'не заполнен'
      const message =
        `👤 Новый клиент \n📞 Номер телефона: ${number} \n🧩 Имя Фамилия: ${name || info} \n📥 Почта: ${email || info} \n🕓 Время регистрации: ${date || info} \nℹ️ Описание: ${desc || info} \n🔑 Услуга : ${service || info}`
      await axios.post(telegramApiUrl, {
        chat_id: bot_id, // ID чата или группы
        text: message,  // Текст сообщения
      });

      res.status(201).json({ data: newAuth });
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ error: err.message });
    }
  }
  async getAuth(req, res) {
    try {
      const auths = await AuthSchema.find();
      res.status(201).json({ data: auths });
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ error: err.message });
    }
  }
  async getAuthById(req, res) {
    console.log(1);

    try {
      const auths = await AuthSchema.findById(req.params.id);
      res.status(201).json({ data: auths });
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ error: err.message });
    }
  }

  async putAuth(req, res) {
    try {
      const { id } = req.params;
      const { name, number, email, desc, date } = req.body;
      console.log(req.body, id);


      const product = await AuthSchema.findOne({ id: id });
      if (!product) {
        return res.status(404).json({ message: 'Продукт не найден' });
      }


      product.name = name != "null" ? name : product.name;
      product.number = number != "null" ? number : product.number;
      product.email = email != "null" ? email : product.email;
      product.desc = desc != "null" ? desc : product.desc;
      product.email = date != "null" ? date : product.date;




      await product.save();
      product.id = product._id.toString()

      // Возвращаем объект с полем `id`
      res.status(200).json({
        data: product // Возвращаем остальные поля объекта
      });
    } catch (error) {
      res.status(500).json({ message: 'Ошибка при обновлении продукта' });
    }
  }

  async deleteAuth(req, res) {
    try {
      const { id } = req.params;
      console.log(id);

      const service = await AuthSchema.findOne({ id: id });
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }

      await AuthSchema.findByIdAndDelete(service._id);
      res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete service', error: error.message });
    }
  };


  async sendMessage(req, res) {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).send("Пожалуйста, предоставьте номер и сообщение.");
    }

    try {
      // Убедитесь, что используете правильный номер отправителя (From) для WhatsApp
      const response = await client.messages.create({
        body: message,
        from: 'whatsapp:+14155238886', // Тестовый номер песочницы Twilio
        to: `whatsapp:${to}`, // Номер клиента
      });

      res.status(200).json({
        success: true,
        message: "Сообщение успешно отправлено",
        response,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Ошибка при отправке сообщения",
        error: error.message,
      });
    }
  };

  async getMessage(req, res) {
    console.log(req.body);
    
    const message = req.body.Body; // Текст входящего сообщения
    const from = req.body.From;   // Номер отправителя

    console.log(`Новое сообщение от ${from}: ${message}`);

    // Ответ пользователю
    res.set('Content-Type', 'text/xml');
    res.send(`
      <Response>
        <Message>
          Привет! Спасибо за ваше сообщение: "${message}"
        </Message>
      </Response>
    `);
  }

}

module.exports = new AuthController()