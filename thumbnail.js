function clamp(min,max,val) {
  return Math.min(Math.max(val,min),max);
}

class Thumbnail {
  constructor(id) {
    this.id = id;
    this.div = document.getElementById(id);
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.view = document.createElement('canvas');
    this.view.style.visibility = "hidden";
    this.view_ctx = this.view.getContext('2d');
    this.canvas.width=640;
    this.canvas.height=480;
    this.canvas.draggable = true;
    this.canvas.style.border="1px solid black";
    this.div.appendChild(this.canvas);
    this.image = new Image();
    this.ratio = 1;
    this.ratio = 1;
    // Number inputs
    this.div.appendChild(document.createElement("br"));
    this.x_input = this._createInput("number", 0, "x");
    this.x_input.min = 0;
    this.y_input = this._createInput("number", 0, "y");
    this.y_input.min = 0;
    this.width_input = this._createInput("number", 3840, "width");
    this.height_input = this._createInput("number", 2160, "height");
    this.preview_btn = this._createInput("button", "Preview", "preview");
    this.done_btn = this._createInput("button", "Done", "done");
    this.div.appendChild(this.x_input);
    this.div.appendChild(this.y_input);
    this.div.appendChild(this.width_input);
    this.div.appendChild(this.height_input);
    this.div.appendChild(this.preview_btn);
    this.div.appendChild(this.done_btn);
    this.div.appendChild(document.createElement("br"));
    this.div.appendChild(this.view);
    this.roi = {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    };

    this.x_input.addEventListener("change", this.draw.bind(this));
    this.y_input.addEventListener("change", this.draw.bind(this));
    this.width_input.addEventListener("change", this.draw.bind(this));
    this.height_input.addEventListener("change", this.draw.bind(this));
    this.preview_btn.addEventListener("click", this.preview.bind(this));
    this.done_btn.addEventListener("click", this.done.bind(this));
    // Canvas drag events.
    this.canvas.addEventListener("mousedown", this.clickBox.bind(this));
  }

  setImage(img) {
    this.image = img;
    var h_rat = this.canvas.width / this.image.width;
    var v_rat = this.canvas.height / this.image.height;
    this.ratio = Math.min(v_rat, h_rat);
    // Compute large scale.
    var v_scale = this.height_input.value / this.image.height;
    var h_scale = this.width_input.value / this.image.width;
    this.scale = Math.max(v_scale, h_scale); 
    this.x_input.value = 0;
    this.y_input.value = 0;
    this.draw();
  }

  draw() {
    this._getRoi()
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    this.ctx.drawImage(this.image, 0,0, this.image.width, this.image.height, 0,0, this.image.width*this.ratio, this.image.height*this.ratio);
    this._drawRect()
    // Draw view context.
    this.view.width = this.outputWidth()
    this.view.height = this.outputHeight()
    this.view_ctx.clearRect(0,0, this.view.width, this.view.height);
    var img_roi = this.imageRoi()
    var roi = this.roi
    this.view_ctx.drawImage(this.image, img_roi.x, img_roi.y,img_roi.width, img_roi.height, 0, 0, roi.width, roi.height);
  }

  width() {
    return this.image.width;
  }

  height() {
    return this.image.height;
  }

  outputWidth() {
    return this.width_input.value;
  }

  outputHeight() {
    return this.height_input.value;
  }

  _createInput(type, value, id) {
    var input = document.createElement("input")
    input.type = type;
    input.id = id;
    input.value = value;
    return input;
  }

  _getRoi() {
    this.roi = {
      x: this.x_input.value,
      y: this.y_input.value,
      width: this.outputWidth(),
      height: this.outputHeight(),
    }
    this.x_input.max = this.image.width * this.scale - this.outputWidth();
    this.y_input.max = this.image.height * this.scale - this.outputHeight();
  }

  imageRoi() {
    // Convert ROI to image space.
    var roi = this.roi;
    return {
      x: roi.x / this.scale,
      y: roi.y / this.scale,
      width: this.outputWidth() / this.scale,
      height: this.outputHeight() / this.scale,
    }
  }

  thumbnailRoi() {
    // Image space to thumbnail sapce
    var roi = this.imageRoi();
    return {
      x: roi.x * this.ratio,
      y: roi.y * this.ratio,
      width: roi.width * this.ratio,
      height: roi.height * this.ratio,
    }
  }

  _drawRect() {
    var roi = this.thumbnailRoi();
    this.ctx.beginPath();
    this.ctx.rect(roi.x, roi.y, roi.width, roi.height);
    this.ctx.strokeStyle = "red";
    this.ctx.stroke();
  }

  imageData() {
    return this.view.toDataURL('image/png');
  }
  
  preview() {
    if(this.view.style.visibility == "visible") {
      this.view.style.visibility = "hidden";
    } else {
      this.view.style.visibility = "visible";
    }
  }

  done() {
    var img = new Image();
    img.src = this.imageData();
    var w = window.open("");
    w.document.write(img.outerHTML);
  }

  clickBox(event) {
    var scale = this.scale / this.ratio;
    event.preventDefault();
    var rect = this.canvas.getBoundingClientRect()
    x = parseInt(event.clientX - rect.left) * scale;
    y = parseInt(event.clientY - rect.top) * scale;
    this.x_input.value = clamp(0,this.x_input.max,x);
    this.y_input.value = clamp(0,this.y_input.max,y);
    this.draw();
  }
}
