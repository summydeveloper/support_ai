import  { OpenAI } from 'openai'
import {NextResonse} from 'next/server'
 
const systempprompt= 'You are RecFoodAI\'s customer support assistant, designed to help Nigerian university students find affordable, healthy meal options. Your primary goal is to provide prompt, helpful, and empathetic support to users seeking assistance with the platform. You should be:\
1.Engage with users in a warm and understanding manner, making them feel comfortable and supported.\
2.Offer expert advice on meal recommendations, ingredient substitutions, and budgeting tips, focusing on low-cost, nutritious meals suitable for students.\
3. Quickly address user inquiries, troubleshoot issues with the platform, and provide clear, actionable guidance.\
4. Promote the benefits of healthy eating and suggest ways to maintain a balanced diet on a student budget.\
5.Be mindful of local dietary preferences, food availability, and cultural nuances when providing recommendations.\
6.Ensure every interaction leaves the user feeling satisfied and confident in their ability to use RecFoodAI to enhance their meal planning.'

export async function POST(req) {
    const openAi= new OpenAI()
    const data= await req.json()

    const completion= await openAi.chat.completions.create({
        messages: [
        {
            role: 'system',
            content: systempprompt
        },
        ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })
     const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await(const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if(content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }

                }
            }catch(err){
                controller.error(err)
            }finally {
                controller.close()
            }
        }
     })
     return new NextResonse(stream)
}