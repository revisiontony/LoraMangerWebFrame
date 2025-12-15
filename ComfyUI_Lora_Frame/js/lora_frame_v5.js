import { app } from "../../scripts/app.js";

app.registerExtension({
	name: "Comfy.LoraWebFrame",
	async beforeRegisterNodeDef(nodeType, nodeData, app) {
		if (nodeData.name === "LoraWebFrame") {
			const onNodeCreated = nodeType.prototype.onNodeCreated;
			
			nodeType.prototype.onNodeCreated = function () {
				const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

				// --- OPTIMIZATION 1: Configuration ---
				// Default to port 8000 since you confirmed that works
				const defaultUrl = "http://127.0.0.1:8000/loras";
				let resizeTimer; // Variable to help us debounce resizing

				// --- Widget Setup ---
				const urlWidget = this.addWidget("text", "URL", defaultUrl, (v) => {}, {});
				
				this.addWidget("button", "Update / Go", null, () => {
					loadURL(urlWidget.value);
				});

				// --- OPTIMIZATION 2: Lightweight Iframe ---
				const iframe = document.createElement("iframe");
				
				// Sandbox permissions allow scripts/forms but prevent it from hijacking the main UI
				iframe.setAttribute("sandbox", "allow-scripts allow-forms allow-same-origin allow-popups allow-presentation");
				iframe.setAttribute("loading", "lazy"); // Browser native lazy loading
				
				Object.assign(iframe.style, {
					width: "100%",
					height: "100%",
					border: "none",
					display: "block",
					backgroundColor: "#222" // Dark grey is easier on eyes than pink
				});

				// Wrapper container
				const wrapper = document.createElement("div");
				Object.assign(wrapper.style, {
					width: "100%",
					height: "200px",
					overflow: "hidden"
				});
				wrapper.appendChild(iframe);

				const domWidget = this.addDOMWidget("lora_iframe", "div", wrapper, {
					serialize: false,
					hideOnZoom: false
				});

				// --- Helper Functions ---
				function loadURL(url) {
					// Don't reload if it's already the same URL to save resources
					if (iframe.src === url) return;
					iframe.src = url;
				}

				// --- OPTIMIZATION 3: Efficient Resizing ---
				this.onResize = function (size) {
					// Use requestAnimationFrame to prevent layout thrashing
					if (resizeTimer) cancelAnimationFrame(resizeTimer);
					
					resizeTimer = requestAnimationFrame(() => {
						// Header + Widgets ~90px offset
						const safeHeight = size[1] - 90;
						
						// Only apply style if dimensions actually changed
						if (wrapper.style.height !== safeHeight + "px") {
							wrapper.style.height = safeHeight + "px";
							domWidget.element.style.height = safeHeight + "px";
						}
					});
				};

				// --- OPTIMIZATION 4: Delayed Startup ---
				// We wait 1 full second after the node is created to load the content.
				// This allows ComfyUI to finish its heavy initialization first.
				setTimeout(() => {
					// Set default size only if it's too small
					if (this.size[0] < 200) {
						this.setSize([1200, 900]);
					}
					// Trigger the load
					loadURL(urlWidget.value);
					this.onResize(this.size);
				}, 1000);

				return r;
			};
		}
	},
});