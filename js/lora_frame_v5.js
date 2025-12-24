import { app } from "../../scripts/app.js";

app.registerExtension({
	name: "Comfy.LoraWebFrame",
	async beforeRegisterNodeDef(nodeType, nodeData, app) {
		if (nodeData.name === "LoraWebFrame") {
			const onNodeCreated = nodeType.prototype.onNodeCreated;
			const onConfigure = nodeType.prototype.onConfigure;
			
			nodeType.prototype.onNodeCreated = function () {
				const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
				const node = this;

				// Configuration
				const defaultUrl = "http://127.0.0.1:8000/loras";
				let resizeTimer;

				// Widget Setup - Load saved URL from workflow or use default
				const savedUrl = this.widgets_values?.[0] ?? defaultUrl;
				const urlWidget = this.addWidget("text", "URL", savedUrl, (v) => {
					loadURL(v);
				}, {});
				
				const scanBtn = this.addWidget("button", "Port Scan", null, async () => {
					await performPortScan();
				});

				// Create iframe with security sandbox
				const iframe = document.createElement("iframe");
				iframe.setAttribute("sandbox", "allow-scripts allow-forms allow-same-origin allow-popups allow-presentation");
				iframe.setAttribute("loading", "lazy");
				
				Object.assign(iframe.style, {
					width: "100%",
					height: "100%",
					border: "none",
					display: "block",
					backgroundColor: "#222"
				});

				// Error handling for iframe load failures
				iframe.addEventListener("error", () => {
					console.error("LoraWebFrame: Failed to load URL", iframe.src);
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

				// Port scanning logic to find Lora Manager (ports 8000-8005)
				async function performPortScan() {
					if (scanBtn.label === "Scanning...") return;
					const originalLabel = scanBtn.label || "Port Scan";
					scanBtn.label = "Scanning...";
					if (node.setDirtyCanvas) node.setDirtyCanvas(true, true);
					
					console.log("LoraWebFrame: Starting discovery...");
					
					try {
						// Strategy 1: Try current window origin first (most likely correct if Lora Manager is installed)
						const originUrl = `${window.location.origin}/loras`;
						try {
							const originCheck = await fetch(originUrl, { method: 'HEAD', cache: 'no-cache' });
							if (originCheck.ok) {
								console.log(`LoraWebFrame: Found Lora Manager on current origin: ${originUrl}`);
								urlWidget.value = originUrl;
								loadURL(originUrl, true);
								return true;
							}
						} catch (e) {
							console.log("LoraWebFrame: Current origin check failed, trying server-side scan");
						}

						// Strategy 2: Try server-side scan (bypass CORS/caching)
						try {
							const response = await fetch('/lora-web-frame/scan-port');
							if (response.ok) {
								const data = await response.json();
								if (data.url) {
									console.log(`LoraWebFrame: Found Lora Manager via server-side scan: ${data.url}`);
									urlWidget.value = data.url;
									loadURL(data.url, true);
									return true;
								}
							}
						} catch (e) {
							console.error("LoraWebFrame: Server-side scan failed, falling back to basic scan", e);
						}
						
						// Strategy 3: Brute force client-side scan (ports 8000-8005)
						const ports = [8000, 8001, 8002, 8003, 8004, 8005];
						for (const port of ports) {
							const testUrl = `http://127.0.0.1:${port}/loras`;
							if (testUrl === originUrl) continue;
							
							try {
								const controller = new AbortController();
								const timeoutId = setTimeout(() => controller.abort(), 500);
								await fetch(testUrl, { mode: 'no-cors', cache: 'no-cache', signal: controller.signal });
								clearTimeout(timeoutId);
								console.log(`LoraWebFrame: Found active port ${port} via fallback scan`);
								urlWidget.value = testUrl;
								loadURL(testUrl, true);
								return true;
							} catch (err) { continue; }
						}
					} finally {
						scanBtn.label = originalLabel;
						if (node.setDirtyCanvas) node.setDirtyCanvas(true, true);
					}
					
					console.error("LoraWebFrame: Lora Manager not found on ports 8000-8005 or current origin.");
					return false;
				}

				// Helper function with URL validation
				function loadURL(url, force = false) {
					if (!url) return;
					if (!force && iframe.src === url) return;
					
					try {
						new URL(url);
						if (force) {
							iframe.src = "about:blank";
							setTimeout(() => { iframe.src = url; }, 50);
						} else {
							iframe.src = url;
						}
					} catch (e) {
						console.error("LoraWebFrame: Invalid URL", url);
					}
				}

				// Efficient resizing with requestAnimationFrame
				this.onResize = function (size) {
					if (resizeTimer) cancelAnimationFrame(resizeTimer);
					
					resizeTimer = requestAnimationFrame(() => {
						const safeHeight = Math.max(size[1] - 90, 100);
						
						if (wrapper.style.height !== safeHeight + "px") {
							wrapper.style.height = safeHeight + "px";
							domWidget.element.style.height = safeHeight + "px";
						}
					});
				};

				// Cleanup handler
				this.onRemoved = function () {
					if (resizeTimer) cancelAnimationFrame(resizeTimer);
					if (iframe) iframe.src = "";
				};

				// Delayed startup to allow ComfyUI initialization
				setTimeout(async () => {
					if (this.size[0] < 200) {
						this.setSize([1200, 900]);
					}
					// Proactively scan for the correct port on startup
					await performPortScan();
					this.onResize(this.size);
				}, 1000);

				return r;
			};

			nodeType.prototype.onConfigure = function (config) {
				const r = onConfigure ? onConfigure.apply(this, arguments) : undefined;
				// Trigger discovery when the node is configured (loaded from workflow)
				setTimeout(() => {
					if (this.widgets && this.widgets[1] && this.widgets[1].name === "Port Scan") {
						this.widgets[1].callback();
					}
				}, 500);
				return r;
			};
		}
	},
});