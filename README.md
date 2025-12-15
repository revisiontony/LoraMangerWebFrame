# ✨ ComfyUI Lora Manager Web Frame

![Setup Guide](setup_guide.png)

A simple custom node that embeds the full [ComfyUI-Lora-Manager](https://github.com/willmiao/ComfyUI-Lora-Manager) web interface directly into your ComfyUI workflow graph. This eliminates the need to have a separate browser tab open for managing your LoRAs and recipes.

## Prerequisites

This node is a wrapper and **requires** the original extension to be installed and active.

1.  **Install ComfyUI-Lora-Manager:** Use ComfyUI Manager or install manually from [willmiao/ComfyUI-Lora-Manager](https://github.com/willmiao/ComfyUI-Lora-Manager).
2.  **Verify it works:** Ensure you can access the manager at `http://127.0.0.1:8000/loras` (or your specific port) in your browser before using this node.
3.  Added my workflows to the github as examples for other users.

## Installation

1.  Navigate to your ComfyUI `custom_nodes` directory.
2.  Create a folder named `ComfyUI_Lora_Frame`.
3.  Inside that folder, ensure your structure looks **exactly** like this:

```text
custom_nodes/
└── ComfyUI_Lora_Frame/
    ├── __init__.py
    ├── lora_frame.py
    └── js/
        └── lora_frame_v5.js
````

## Usage

### Changing the Address

If your ComfyUI instance is running on a different port or remote address, you can update the target URL directly on the node.

1.  **Click the Address Bar:** Click the text input field at the top of the node displaying the URL.
2.  **Edit:** Type in your specific address (e.g., `http://127.0.0.1:8000/loras`).
3.  **Refresh:** Click the **Update / Go** button to reload the embedded frame.

<!-- end list -->

```

### Next Step
Would you like me to help you format the `address_guide.png` placeholder text if you haven't taken the screenshot yet?
```
