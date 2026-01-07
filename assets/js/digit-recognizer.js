class DigitRecognizer {
    constructor() {
        this.canvas = document.getElementById('drawing-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.brushSize = 15;

        // API endpoint
        this.API_URL = 'http://localhost:5000/api';

        // CNN visualization state
        this.currentLayerIndex = 0;
        this.cnnData = null;
        this.isPlaying = false;
        this.playInterval = null;

        this.init();
    }
    
    init() {
        // Set up canvas
        this.clearCanvas();
        
        // Event listeners
        this.setupDrawingEvents();
        this.setupControls();
        
        // Check API health
        this.checkAPIHealth();
    }
    
    setupDrawingEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });
    }
    
    setupControls() {
        // Brush size
        const brushSlider = document.getElementById('brush-size');
        const brushValue = document.getElementById('brush-value');

        brushSlider.addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            brushValue.textContent = this.brushSize;
        });

        // Buttons
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearCanvas();
            this.clearResults();
        });

        document.getElementById('recognize-btn').addEventListener('click', () => {
            this.recognizeDigits();
        });

        // CNN Visualization controls
        const learnBtn = document.getElementById('learn-cnn-btn');
        if (learnBtn) {
            learnBtn.addEventListener('click', () => this.showCNNVisualization());
        }

        const playBtn = document.getElementById('play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.togglePlayAnimation());
        }

        const prevBtn = document.getElementById('prev-layer-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousLayer());
        }

        const nextBtn = document.getElementById('next-layer-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextLayer());
        }

        const closeBtn = document.getElementById('close-viz-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeCNNVisualization());
        }
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getMousePos(e);
        
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = this.brushSize * 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        
        this.lastX = pos.x;
        this.lastY = pos.y;
    }
    
    stopDrawing() {
        this.isDrawing = false;
    }
    
    clearCanvas() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    clearResults() {
        document.querySelector('.result-number').textContent = '?';
        document.querySelector('.result-confidence').textContent = '';
        document.getElementById('individual-digits').innerHTML = '';
    }
    
    async checkAPIHealth() {
        const statusIndicator = document.getElementById('status-indicator');
        
        try {
            const response = await fetch(`${this.API_URL}/health`);
            const data = await response.json();
            
            if (data.status === 'ok') {
                statusIndicator.classList.add('ready');
                console.log('✓ API is ready');
            }
        } catch (error) {
            console.error('API health check failed:', error);
            statusIndicator.classList.remove('ready');
            alert('⚠️ Cannot connect to API. Make sure Flask server is running on port 5000.');
        }
    }
    
    async recognizeDigits() {
        const statusIndicator = document.getElementById('status-indicator');
        statusIndicator.classList.remove('ready');
        statusIndicator.classList.add('processing');
        
        try {
            // Get canvas as base64
            const imageData = this.canvas.toDataURL('image/png');
            
            // Call API
            const response = await fetch(`${this.API_URL}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: imageData })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.displayResults(data);
            } else {
                alert('Error: ' + (data.error || 'Unknown error'));
            }
            
        } catch (error) {
            console.error('Recognition error:', error);
            alert('Failed to recognize digits. Is the Flask server running?');
        } finally {
            statusIndicator.classList.remove('processing');
            statusIndicator.classList.add('ready');
        }
    }
    
    displayResults(data) {
        // Main result
        const resultNumber = document.querySelector('.result-number');
        const resultConfidence = document.querySelector('.result-confidence');
        
        if (data.digits.length === 0) {
            resultNumber.textContent = '?';
            resultConfidence.textContent = 'No digits found';
            return;
        }
        
        resultNumber.textContent = data.number;
        
        const avgConfidence = data.digits.reduce((sum, d) => sum + d.confidence, 0) / data.digits.length;
        resultConfidence.textContent = `Confidence: ${(avgConfidence * 100).toFixed(1)}%`;
        
        // Individual digits
        const container = document.getElementById('individual-digits');
        container.innerHTML = '';
        
        data.digits.forEach((digit, idx) => {
            const card = document.createElement('div');
            card.className = 'digit-card';
            
            if (digit.confidence < 0.6) {
                card.classList.add('low-confidence');
            }
            
            const img = document.createElement('img');
            img.src = digit.processed_image;
            img.alt = `Digit ${digit.digit}`;
            
            const info = document.createElement('div');
            info.className = 'digit-info';
            
            const prediction = document.createElement('div');
            prediction.className = 'digit-prediction';
            prediction.textContent = `Digit #${idx + 1}: ${digit.digit}`;
            
            const confidence = document.createElement('div');
            confidence.className = 'digit-confidence';
            confidence.textContent = `Confidence: ${(digit.confidence * 100).toFixed(1)}%`;
            
            if (digit.confidence < 0.6) {
                confidence.textContent += ' ⚠️ Low';
            }
            
            const top3 = document.createElement('div');
            top3.className = 'digit-top3';
            top3.textContent = `Top 3: ${digit.top3.map(t => `${t.digit} (${(t.confidence * 100).toFixed(1)}%)`).join(', ')}`;
            
            info.appendChild(prediction);
            info.appendChild(confidence);
            info.appendChild(top3);
            
            card.appendChild(img);
            card.appendChild(info);
            
            container.appendChild(card);
        });
    }

    async showCNNVisualization() {
        const modal = document.getElementById('cnn-visualization-modal');
        if (!modal) return;

        const imageData = this.canvas.toDataURL('image/png');

        try {
            const response = await fetch(`${this.API_URL}/visualize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageData })
            });

            const data = await response.json();

            if (data.success) {
                this.cnnData = data;
                this.currentLayerIndex = 0;
                this.renderCNNVisualization();
                modal.classList.add('active');
            } else {
                alert('Error: ' + (data.error || 'Draw a digit first!'));
            }
        } catch (error) {
            console.error('Visualization error:', error);
            alert('Failed to generate visualization. Is the Flask server running?');
        }
    }

    closeCNNVisualization() {
        const modal = document.getElementById('cnn-visualization-modal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.stopPlayAnimation();
    }

    renderCNNVisualization() {
        if (!this.cnnData) return;

        const layerTitle = document.getElementById('layer-title');
        const layerDescription = document.getElementById('layer-description');
        const featureGrid = document.getElementById('feature-grid');
        const progressBar = document.getElementById('layer-progress-bar');
        const layerCounter = document.getElementById('layer-counter');
        const visualExplainer = document.getElementById('visual-explainer');

        // Total layers = input (index 0) + actual model layers
        const totalLayers = this.cnnData.layers.length + 1;

        // Update progress
        const progress = ((this.currentLayerIndex + 1) / totalLayers) * 100;
        progressBar.style.width = `${progress}%`;
        layerCounter.textContent = `Layer ${this.currentLayerIndex + 1} / ${totalLayers}`;

        // Render feature maps
        featureGrid.innerHTML = '';

        if (this.currentLayerIndex === 0) {
            // Show input
            const description = this.getLayerDescription(null);
            layerTitle.textContent = 'INPUT';
            layerDescription.textContent = description.text;
            visualExplainer.innerHTML = this.createVisualExplainer(description.visual, null);

            const inputContainer = document.createElement('div');
            inputContainer.className = 'feature-map-large';
            const img = document.createElement('img');
            img.src = this.cnnData.input_image;
            inputContainer.appendChild(img);
            featureGrid.appendChild(inputContainer);
        } else {
            // Show actual layer (index - 1 because we added input at index 0)
            const layer = this.cnnData.layers[this.currentLayerIndex - 1];
            const description = this.getLayerDescription(layer);
            layerTitle.textContent = layer.layer_name.toUpperCase();
            layerDescription.textContent = description.text;
            visualExplainer.innerHTML = this.createVisualExplainer(description.visual, layer);

            if (layer.type === 'conv') {
                layer.feature_maps.forEach((featureMap, idx) => {
                    const mapContainer = document.createElement('div');
                    mapContainer.className = 'feature-map';
                    mapContainer.style.animationDelay = `${idx * 0.05}s`;

                    const img = document.createElement('img');
                    img.src = featureMap;
                    img.alt = `Feature ${idx}`;

                    const label = document.createElement('div');
                    label.className = 'feature-label';
                    label.textContent = `Filter ${idx + 1}`;

                    mapContainer.appendChild(img);
                    mapContainer.appendChild(label);
                    featureGrid.appendChild(mapContainer);
                });
            } else if (layer.type === 'dense') {
                const barChart = this.createDenseLayerVisualization(layer.values);
                featureGrid.appendChild(barChart);
            }

            // Show final prediction if on last layer
            if (this.currentLayerIndex === this.cnnData.layers.length) {
                const predictionDisplay = document.createElement('div');
                predictionDisplay.className = 'final-prediction';
                predictionDisplay.innerHTML = `
                    <div class="prediction-digit">${this.cnnData.predicted_digit}</div>
                    <div class="prediction-confidence">${(this.cnnData.confidence * 100).toFixed(1)}% confident</div>
                `;
                featureGrid.appendChild(predictionDisplay);
            }
        }
    }

    createVisualExplainer(type, layer) {
        switch(type) {
            case 'input':
                return `
                    <div class="explainer-card">
                        <div class="explainer-icon">📥</div>
                        <div class="explainer-text">
                            <strong>START HERE</strong>
                            <span>Your drawing becomes a 28×28 grid of numbers (0-255)</span>
                        </div>
                    </div>
                `;
            case 'conv':
                return `
                    <div class="explainer-card">
                        <div class="explainer-icon">🔍</div>
                        <div class="explainer-text">
                            <strong>PATTERN DETECTION</strong>
                            <span>Each filter looks for specific patterns: edges ┃ curves ⌒ corners ⌐</span>
                        </div>
                    </div>
                    <div class="explainer-visual">
                        <div class="filter-demo">
                            <div class="filter-box">3×3 Filter</div>
                            <div class="arrow">→</div>
                            <div class="filter-box">Slides across image</div>
                            <div class="arrow">→</div>
                            <div class="filter-box">Finds matches</div>
                        </div>
                    </div>
                `;
            case 'pool':
                return `
                    <div class="explainer-card">
                        <div class="explainer-icon">⬇️</div>
                        <div class="explainer-text">
                            <strong>COMPRESSION</strong>
                            <span>Reduces size by keeping only the strongest signals</span>
                        </div>
                    </div>
                    <div class="explainer-visual">
                        <div class="pool-demo">
                            <div class="grid-before">4×4</div>
                            <div class="arrow">→</div>
                            <div class="grid-after">2×2</div>
                            <div class="pool-label">Takes max value from each 2×2 area</div>
                        </div>
                    </div>
                `;
            case 'dense':
                return `
                    <div class="explainer-card">
                        <div class="explainer-icon">🧠</div>
                        <div class="explainer-text">
                            <strong>COMBINING PATTERNS</strong>
                            <span>Neurons connect patterns together to recognize complex shapes</span>
                        </div>
                    </div>
                `;
            case 'output':
                return `
                    <div class="explainer-card">
                        <div class="explainer-icon">🎯</div>
                        <div class="explainer-text">
                            <strong>FINAL ANSWER</strong>
                            <span>10 neurons compete - highest score wins!</span>
                        </div>
                    </div>
                    <div class="explainer-visual">
                        <div class="output-demo">
                            <div class="neuron-race">
                                Each bar = How confident the network is for that digit
                            </div>
                        </div>
                    </div>
                `;
            default:
                return '<div class="explainer-card"><div class="explainer-icon">⚙️</div><div class="explainer-text"><strong>PROCESSING</strong><span>Data flowing through the network...</span></div></div>';
        }
    }

    getLayerDescription(layer) {
        if (!layer || this.currentLayerIndex === 0) {
            return {
                text: 'Your drawn digit (28×28 pixels)',
                visual: 'input'
            };
        } else if (layer.layer_name.includes('conv2d')) {
            return {
                text: `Scanning image with ${layer.shape[2]} filters to detect features`,
                visual: 'conv'
            };
        } else if (layer.layer_name.includes('pool')) {
            return {
                text: `Shrinking image while keeping important information`,
                visual: 'pool'
            };
        } else if (layer.layer_name.includes('dense') && layer.shape[0] === 10) {
            return {
                text: `Final decision: Which digit (0-9)?`,
                visual: 'output'
            };
        } else if (layer.layer_name.includes('dense')) {
            return {
                text: `${layer.shape[0]} neurons combining patterns`,
                visual: 'dense'
            };
        }
        return {
            text: `Processing... | Shape: ${layer.shape.join('×')}`,
            visual: 'default'
        };
    }

    createDenseLayerVisualization(values) {
        const container = document.createElement('div');
        container.className = 'dense-layer-viz';

        if (values.length === 10) {
            // Final layer - show digit probabilities
            const probabilities = this.cnnData.all_probabilities;
            for (let i = 0; i < 10; i++) {
                const barContainer = document.createElement('div');
                barContainer.className = 'probability-bar-container';

                const label = document.createElement('div');
                label.className = 'probability-label';
                label.textContent = i;

                const barWrapper = document.createElement('div');
                barWrapper.className = 'probability-bar-wrapper';

                const bar = document.createElement('div');
                bar.className = 'probability-bar';
                const percentage = probabilities[i] * 100;
                bar.style.width = `${percentage}%`;
                bar.style.animationDelay = `${i * 0.05}s`;

                if (i === this.cnnData.predicted_digit) {
                    bar.classList.add('predicted');
                }

                const value = document.createElement('div');
                value.className = 'probability-value';
                value.textContent = `${percentage.toFixed(1)}%`;

                barWrapper.appendChild(bar);
                barContainer.appendChild(label);
                barContainer.appendChild(barWrapper);
                barContainer.appendChild(value);
                container.appendChild(barContainer);
            }
        } else {
            // Intermediate dense layer - show neuron activations
            const maxActivations = Math.min(values.length, 20);
            const sortedIndices = values
                .map((val, idx) => ({ val, idx }))
                .sort((a, b) => b.val - a.val)
                .slice(0, maxActivations);

            sortedIndices.forEach(({ val, idx }, i) => {
                const neuronDiv = document.createElement('div');
                neuronDiv.className = 'neuron-activation';
                neuronDiv.style.animationDelay = `${i * 0.03}s`;

                const intensity = Math.min(Math.max(val, 0), 1);
                neuronDiv.style.background = `rgba(0, 217, 255, ${intensity})`;
                neuronDiv.style.width = `${intensity * 100}%`;

                neuronDiv.textContent = `N${idx}: ${val.toFixed(2)}`;
                container.appendChild(neuronDiv);
            });
        }

        return container;
    }

    nextLayer() {
        console.log('nextLayer called', this.currentLayerIndex);
        if (!this.cnnData) {
            console.log('No CNN data');
            return;
        }
        // Total layers includes input (0) + all model layers
        const totalLayers = this.cnnData.layers.length + 1;
        console.log('Total layers:', totalLayers, 'Current:', this.currentLayerIndex);
        if (this.currentLayerIndex < totalLayers - 1) {
            this.currentLayerIndex++;
            console.log('Moving to layer:', this.currentLayerIndex);
            this.renderCNNVisualization();
        } else {
            console.log('Already at last layer');
        }
    }

    previousLayer() {
        console.log('previousLayer called', this.currentLayerIndex);
        if (!this.cnnData) {
            console.log('No CNN data');
            return;
        }
        if (this.currentLayerIndex > 0) {
            this.currentLayerIndex--;
            console.log('Moving to layer:', this.currentLayerIndex);
            this.renderCNNVisualization();
        } else {
            console.log('Already at first layer');
        }
    }

    togglePlayAnimation() {
        const playBtn = document.getElementById('play-btn');
        if (!playBtn) return;

        if (this.isPlaying) {
            this.stopPlayAnimation();
        } else {
            this.startPlayAnimation();
        }
    }

    startPlayAnimation() {
        this.isPlaying = true;
        const playBtn = document.getElementById('play-btn');
        if (playBtn) {
            playBtn.innerHTML = '⏸ PAUSE';
        }

        this.playInterval = setInterval(() => {
            const totalLayers = this.cnnData.layers.length + 1;
            if (this.currentLayerIndex < totalLayers - 1) {
                this.nextLayer();
            } else {
                this.stopPlayAnimation();
            }
        }, 2000);
    }

    stopPlayAnimation() {
        this.isPlaying = false;
        const playBtn = document.getElementById('play-btn');
        if (playBtn) {
            playBtn.innerHTML = '▶ PLAY';
        }

        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DigitRecognizer();
});