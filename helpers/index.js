const sendGrid = require("@sendgrid/mail");

const { SEN_GRID } = process.env;

function tryCatchWrapper(endpointFn) {
  return async (req, res, next) => {
    try {
      await endpointFn(req, res, next);
    } catch (error) {
      return next(error);
    }
  };
}

async function sendMail({ to, subject, html }) {
  try {
    sendGrid.setApiKey(SEN_GRID);
    const email = {
      to,
      from: "nazariipushkaruk@gmail.com",
      subject,
      html,
    };

    await sendGrid.send(email);
  } catch (error) {
    console.log(error);
  }
}

const message = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not found",
  409: "Conflict",
};

const ValidationError = (status, message = message[status]) => {
  const error = new Error(message);
  error.status = status;

  return error;
};

module.exports = {
  tryCatchWrapper,
  ValidationError,
  sendMail,
};
