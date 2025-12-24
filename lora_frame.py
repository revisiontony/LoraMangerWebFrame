import server
from aiohttp import web
import aiohttp
import asyncio

class LoraWebFrame:
    @classmethod
    def INPUT_TYPES(s):
        return {"required": {}}

    RETURN_TYPES = ()
    FUNCTION = "do_nothing"
    CATEGORY = "utils"

    def do_nothing(self):
        return ()

@server.PromptServer.instance.routes.get("/lora-web-frame/scan-port")
async def scan_port(request):
    # Try the current server's port first, as ComfyUI-Lora-Manager usually attaches to it
    current_host = request.host.split(':')[0] if ':' in request.host else '127.0.0.1'
    try:
        current_port = server.PromptServer.instance.port
    except:
        current_port = None

    ports = [8000, 8001, 8002, 8003, 8004, 8005]
    if current_port and current_port not in ports:
        ports.insert(0, current_port)
    
    found_port = None
    found_url = None
    
    async with aiohttp.ClientSession() as session:
        for port in ports:
            # Try both 127.0.0.1 and the request's host
            for host in [current_host, '127.0.0.1', 'localhost']:
                url = f"http://{host}:{port}/loras"
                try:
                    async with session.get(url, timeout=aiohttp.ClientTimeout(total=0.5)) as response:
                        if response.status == 200:
                            text = await response.text()
                            if any(term in text for term in ["Lora Manager", "LoRA Manager", "recipes"]):
                                found_port = port
                                found_url = url
                                break
                except:
                    continue
            if found_url:
                break
                    
    if found_url:
        return web.json_response({"port": found_port, "url": found_url})
    
    return web.json_response({"port": None, "url": None}, status=404)