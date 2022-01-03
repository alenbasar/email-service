const Responses = require("../responses");
const AWS = require("aws-sdk");
const SES = new AWS.SES();

exports.handler = async (event) => {
  console.log("event", event);

  const { firstName, lastName, email, message, companyName, agent, receiver } =
    JSON.parse(event.body);

  if (
    !firstName ||
    !lastName ||
    !email ||
    !message ||
    !companyName ||
    !agent ||
    !receiver
  ) {
    return Responses._400({ message: "required input missing from the body." });
  }

  let subjectData = `[Contact Request] from: ${email}`;
  const params = {
    Destination: {
      ToAddresses: [receiver],
    },
    Message: {
      Body: {
        Html: {
          Data: `
          <h2>You received a new message</h2>     
          <h3>Name: ${firstName} ${lastName}</h3>
          <h3>Company: ${companyName}</h3>
          <h3>Email: ${email}</h3>
          <h2>Message</h2>
          <h4>${message}</h4>`,
        },
      },
      Subject: { Data: subjectData },
    },
    Source: agent,
  };

  try {
    await SES.sendEmail(params).promise();
    return Responses._200({ message: "Email sent successfully" });
  } catch (error) {
    return Responses._400({ message: "Email failed to send ", error });
  }
};
