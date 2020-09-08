export default class Element extends HTMLElement{
//  static icon = 'icons:description'
  static get is(){
    return 'pineal-logo';
  }

  constructor(){
    super();

    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = `<canvas width='128px' height='128px'></canvas>`;

    this.canvas = this.shadowRoot.querySelector('canvas');
    this.spin();
  }
  
  spin(){
  	var canvas = this.canvas;
	var ctx = canvas.getContext("2d");
	
	var cX = canvas.width/2,
		 cY = canvas.height/2,
		 deg = 2*Math.PI/3,
		 r = canvas.width/5,
		 R = canvas.width/2 - r,
		 stroke = '#275e8f',
		 def = 21,
		 speed = 10,
		 timer,
		 spn = false;
		 
	ctx.save();
		
	var dg = def;
	function draw(){
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.save();
		ctx.translate(cX, cY);
		ctx.scale(1,-1);
		
		if(dg > 360) dg = 1;
		ctx.rotate(dg * Math.PI/180);
		dg+=speed;
	
		function circle(x, y, color){
			ctx.beginPath();
			ctx.arc(x, y, r, 0, 2*Math.PI, false);
			ctx.fillStyle = color;
			ctx.shadowColor = "#CCC";
			ctx.fill();
		}
		ctx.beginPath();
		ctx.moveTo(0, R);
		ctx.lineTo(R*Math.sin(deg), R*Math.cos(deg));
		ctx.lineTo(R*Math.sin(2*deg), R*Math.cos(2*deg));
		ctx.closePath();
		ctx.lineWidth = r/2;
		ctx.strokeStyle = stroke;
		ctx.lineJoin = 'round';
		ctx.stroke();
		
		ctx.globalAlpha = 0.9;

		var blue = ctx.createLinearGradient(0,R+r,0,R-r);
		blue.addColorStop(0,'#1BA5E0');
		blue.addColorStop(1,'#118BBF');
		
		var orange = ctx.createLinearGradient(R*Math.sin(deg), R*Math.cos(deg)+r, R*Math.sin(deg), R*Math.cos(deg)-r);
		orange.addColorStop(0,'#F08A05');
		orange.addColorStop(1,'#E66E05');
		
		var green = ctx.createLinearGradient(R*Math.sin(2*deg), R*Math.cos(2*deg)+r, R*Math.sin(2*deg), R*Math.cos(2*deg)-r);
		green.addColorStop(0,'#27BD17');
		green.addColorStop(1,'#199E0B');

		circle(0, R, blue);
		circle(R*Math.sin(deg), R*Math.cos(deg), orange);
		circle(R*Math.sin(2*deg), R*Math.cos(2*deg), green);
		ctx.restore();
		
		if(dg == def && !spn && timer){
			clearInterval(timer);
			timer = false;
		}
	 }

	 draw();

	 return function(sp){
		if((sp || sp == undefined) && !spn && !timer){
			spn = true;
			timer = setInterval(draw, 20)
		}
		else if(!sp){
			clearInterval(timer);
			timer = setInterval(draw, 5)
			spn = false
		}
	 }
  }
};
    
window.customElements.define(Element.is, Element);