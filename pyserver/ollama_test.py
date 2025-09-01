from ollama import chat
from ollama import ChatResponse
import ollama
import wave
from piper import PiperVoice
from playsound import playsound

# LUCY – Learning Utility for Conversation & Yapping
model_name_og = "llama3.2:3b"
model_name = "LUCY"
ollama.create(model=model_name, from_=model_name_og,
              system="Your name is LUCY. Keep answers short and concise. avoid emojis and keep fluid conversation avoiding things like *. answer questions ")
# Prepending data
# response: ChatResponse = chat(model=model_name, messages=[
#     {
#         'role': 'user',
#         'content': "
#     },
# ])
#

response: ChatResponse = chat(model=model_name, messages=[
    {
        'role': 'user',
        'content': 'Why is the ocean blue?',
    },
])
print(response['message']['content'])
# or access fields directly from the response object
# print(response.message.content)

resp = str(response.message.content)


def TTS(txt_data):
    voice = PiperVoice.load(
        "/Users/akame/Documents/Prog/STELLA/pyserver/en_US-hfc_female-medium.onnx")
    with wave.open("test.wav", "wb") as wav_file:
        voice.synthesize_wav(txt_data, wav_file)

    playsound("/Users/akame/Documents/Prog/STELLA/pyserver/test.wav")


TTS(resp)
