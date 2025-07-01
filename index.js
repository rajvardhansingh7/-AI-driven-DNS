// import { startUdpServer, createResponse, createTxtAnswer } from 'denamed';
// import { GoogleGenAI } from '@google/genai';

// const GEMINI_API_KEY = 'AIzaSyCBqOhsm1y22yMnovIP3kHMCTILHf2RDYA';

// const ai = new GoogleGenAI(GEMINI_API_KEY);

// startUdpServer(
//   async (query) => {
//     console.log(query);
//     const question = query.questions[0];
//     console.log('Question:' , question);

//     const prompt = `Answer the question in one word or sentance.
//     Question: ${question.name.split('.').join(' ')}`;

//     const response = await ai.models.generateContent(prompt,
//       {
//     model: "gemini-2.5-flash",
//   });

//     return createResponse(query,
//       [createTxtAnswer(question, response.response.text())]
//     );
//   },
//   { port: 8000 }
// );


import dgram from 'dgram';
import { encode, decode } from 'dns-packet';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyCBqOhsm1y22yMnovIP3kHMCTILHf2RDYA';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const server = dgram.createSocket('udp4');

server.on('message', async (msg, rinfo) => {
  try {
    const query = decode(msg);
    console.log('Question:', query.questions[0].name);

    const prompt = `Answer in one word or sentence: ${query.questions[0].name.replace(/\./g, ' ')}`;
    const result = await model.generateContent(prompt);
    const text = (await result.response).text();

    const response = {
      type: 'response',
      id: query.id,
      questions: query.questions,
      answers: [{
        type: 'TXT',
        name: query.questions[0].name,
        data: text
      }]
    };

    server.send(encode(response), rinfo.port, rinfo.address);
  } catch (error) {
    console.error('Error:', error);
  }
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.bind(8000, () => {
  console.log('DNS server running on port 8000');
});


