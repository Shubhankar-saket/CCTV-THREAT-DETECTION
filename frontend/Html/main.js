const CANVAS = document.getElementsByTagName("canvas")[0],
	CTX = CANVAS.getContext("2d"),
	W = window.innerWidth,
	H = window.innerHeight,
	XO = W / 2,
	YO = H / 2,
	NUM_PARTICLES = 400,
	MAX_Z = 2,
	MAX_R = 1,
	Z_SPD = 1,
	PARTICLES = [];

class Particle {
	constructor(x, y, z) {
		this.pos = new Vector(x, y, z);
		const X_VEL = 0, Y_VEL = 0, Z_VEL = -Z_SPD;
		this.vel = new Vector(X_VEL, Y_VEL, Z_VEL);
		this.vel.scale(0.005);
		this.fill = "rgba(255,255,255,0.3)";
		this.stroke = this.fill;
	}

	update() {
		this.pos.add(this.vel);
	}

	render() {
		const PIXEL = to2d(this.pos),
			X = PIXEL[0],
			Y = PIXEL[1],
			R = (MAX_Z - this.pos.z) / MAX_Z * MAX_R;

		if (X < 0 || X > W || Y < 0 || Y > H) this.pos.z = MAX_Z;

		this.update();
		CTX.beginPath();
		CTX.fillStyle = this.fill;
		CTX.strokeStyle = this.stroke;
		CTX.arc(X, PIXEL[1], R, 0, Math.PI * 2);
		CTX.fill();
		CTX.stroke();
		CTX.closePath();
	}
}

class Vector {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	add(v) {
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
	}
	
	scale(n) {
		this.x *= n;
		this.y *= n;
		this.z *= n;
	}
}

function to2d(v) {
	const X_COORD = v.x - XO,
		Y_COORD = v.y - YO,
		PX = X_COORD / v.z,
		PY = Y_COORD / v.z;
	return [PX + XO, PY + YO];
}

function render() {
	for (let i = 0; i < PARTICLES.length; i++) {
		PARTICLES[i].render();
	}
}

function loop() {
	requestAnimationFrame(loop);
	CTX.fillStyle = "rgba(0,0,0,0.15)";
	CTX.fillRect(0, 0, W, H);
	render();
}

function createParticles() {
	for (let i = 0; i < NUM_PARTICLES; i++) {
		const X = Math.random() * W, Y = Math.random() * H, Z = Math.random() * MAX_Z;
		PARTICLES.push(new Particle(X, Y, Z));
	}
}

function init() {
	CANVAS.width = W;
	CANVAS.height = H;
	createParticles();
	loop();
}
init();