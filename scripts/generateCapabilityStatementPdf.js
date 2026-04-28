const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const OUTPUT_PATH = path.join(
	process.cwd(),
	'templates/pdf/Tepnology-Capability-Statement.pdf',
);
const LOGO_PATH = path.join(
	process.cwd(),
	'public/tepnology-icon-70-70_myversion.png',
);

function escapePdfText(text) {
	return text
		.replace(/\\/g, '\\\\')
		.replace(/\(/g, '\\(')
		.replace(/\)/g, '\\)');
}

function estimateTextWidth(text, fontSize) {
	return text.length * fontSize * 0.5;
}

function wrapText(text, maxWidth, fontSize) {
	const words = text.split(/\s+/).filter(Boolean);
	const lines = [];
	let current = '';

	for (const word of words) {
		const next = current ? `${current} ${word}` : word;
		if (estimateTextWidth(next, fontSize) <= maxWidth) {
			current = next;
		} else {
			if (current) lines.push(current);
			current = word;
		}
	}

	if (current) lines.push(current);
	return lines;
}

const ops = [];

function push(...lines) {
	ops.push(...lines);
}

function setFillColor(r, g, b) {
	push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`);
}

function setStrokeColor(r, g, b) {
	push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG`);
}

function rect(x, y, w, h, mode = 'f') {
	push(`${x} ${y} ${w} ${h} re ${mode}`);
}

function line(x1, y1, x2, y2) {
	push(`${x1} ${y1} m ${x2} ${y2} l S`);
}

function text(x, y, value, size = 11, font = 'F1') {
	push('BT');
	push(`/${font} ${size} Tf`);
	push(`1 0 0 1 ${x} ${y} Tm`);
	push(`(${escapePdfText(value)}) Tj`);
	push('ET');
}

function wrappedText(x, y, width, value, size = 11, leading = 14, font = 'F1') {
	const lines = wrapText(value, width, size);
	let currentY = y;
	for (const currentLine of lines) {
		text(x, currentY, currentLine, size, font);
		currentY -= leading;
	}
	return currentY;
}

function bulletList(x, y, width, items, size = 10.2, leading = 12.5) {
	let currentY = y;
	for (const item of items) {
		const lines = wrapText(item, width - 14, size);
		text(x, currentY, '-', size, 'F2');
		let lineY = currentY;
		for (const [index, currentLine] of lines.entries()) {
			text(x + 12, lineY, currentLine, size, 'F1');
			if (index < lines.length - 1) lineY -= leading;
		}
		currentY = lineY - leading;
	}
	return currentY;
}

function sectionTitle(x, y, value) {
	text(x, y, value.toUpperCase(), 10.5, 'F2');
}

function boxTitle(x, y, value) {
	text(x, y, value.toUpperCase(), 9.5, 'F2');
}

function card(x, topY, width, height, titleValue, rows) {
	setFillColor(0.984, 0.965, 0.925);
	rect(x, topY - height, width, height, 'f');
	setStrokeColor(0.925, 0.871, 0.784);
	rect(x, topY - height, width, height, 'S');

	setFillColor(0.102, 0.145, 0.220);
	boxTitle(x + 14, topY - 20, titleValue);

	let rowY = topY - 40;
	for (const row of rows) {
		rowY = wrappedText(x + 14, rowY, width - 28, row, 9.2, 11.5, 'F1') - 6;
	}
}

function drawImage(name, x, y, width, height) {
	push('q');
	push(`${width} 0 0 ${height} ${x} ${y} cm`);
	push(`/${name} Do`);
	push('Q');
}

function paethPredictor(a, b, c) {
	const p = a + b - c;
	const pa = Math.abs(p - a);
	const pb = Math.abs(p - b);
	const pc = Math.abs(p - c);
	if (pa <= pb && pa <= pc) return a;
	if (pb <= pc) return b;
	return c;
}

function parsePng(filePath) {
	const buffer = fs.readFileSync(filePath);
	if (buffer.toString('ascii', 1, 4) !== 'PNG') {
		throw new Error(`Unsupported PNG file: ${filePath}`);
	}

	let offset = 8;
	let width = 0;
	let height = 0;
	let bitDepth = 0;
	let colorType = 0;
	const idatChunks = [];

	while (offset < buffer.length) {
		const length = buffer.readUInt32BE(offset);
		const type = buffer.toString('ascii', offset + 4, offset + 8);
		const data = buffer.subarray(offset + 8, offset + 8 + length);
		offset += length + 12;

		if (type === 'IHDR') {
			width = data.readUInt32BE(0);
			height = data.readUInt32BE(4);
			bitDepth = data[8];
			colorType = data[9];
		} else if (type === 'IDAT') {
			idatChunks.push(data);
		} else if (type === 'IEND') {
			break;
		}
	}

	if (bitDepth !== 8 || colorType !== 6) {
		throw new Error('Only 8-bit RGBA PNG files are supported');
	}

	const compressed = Buffer.concat(idatChunks);
	const raw = zlib.inflateSync(compressed);
	const bytesPerPixel = 4;
	const stride = width * bytesPerPixel;
	const pixelData = Buffer.alloc(width * height * bytesPerPixel);
	let inputOffset = 0;
	let previousRow = Buffer.alloc(stride);

	for (let y = 0; y < height; y += 1) {
		const filterType = raw[inputOffset];
		inputOffset += 1;
		const filteredRow = raw.subarray(inputOffset, inputOffset + stride);
		inputOffset += stride;

		const currentRow = pixelData.subarray(y * stride, (y + 1) * stride);

		for (let x = 0; x < stride; x += 1) {
			const left = x >= bytesPerPixel ? currentRow[x - bytesPerPixel] : 0;
			const up = previousRow[x];
			const upperLeft = x >= bytesPerPixel ? previousRow[x - bytesPerPixel] : 0;

			if (filterType === 0) {
				currentRow[x] = filteredRow[x];
			} else if (filterType === 1) {
				currentRow[x] = (filteredRow[x] + left) & 255;
			} else if (filterType === 2) {
				currentRow[x] = (filteredRow[x] + up) & 255;
			} else if (filterType === 3) {
				currentRow[x] = (filteredRow[x] + Math.floor((left + up) / 2)) & 255;
			} else if (filterType === 4) {
				currentRow[x] =
					(filteredRow[x] + paethPredictor(left, up, upperLeft)) & 255;
			} else {
				throw new Error(`Unsupported PNG filter type: ${filterType}`);
			}
		}

		previousRow = Buffer.from(currentRow);
	}

	return { width, height, pixelData };
}

function cropRgbaImage(image, cropX, cropY, cropWidth, cropHeight) {
	const cropped = Buffer.alloc(cropWidth * cropHeight * 4);
	for (let y = 0; y < cropHeight; y += 1) {
		for (let x = 0; x < cropWidth; x += 1) {
			const sourceIndex = ((cropY + y) * image.width + (cropX + x)) * 4;
			const targetIndex = (y * cropWidth + x) * 4;
			image.pixelData.copy(cropped, targetIndex, sourceIndex, sourceIndex + 4);
		}
	}
	return { width: cropWidth, height: cropHeight, pixelData: cropped };
}

function splitRgbaChannels(image) {
	const rgb = Buffer.alloc(image.width * image.height * 3);
	const alpha = Buffer.alloc(image.width * image.height);

	for (let source = 0, rgbOffset = 0, alphaOffset = 0; source < image.pixelData.length; source += 4) {
		rgb[rgbOffset] = image.pixelData[source];
		rgb[rgbOffset + 1] = image.pixelData[source + 1];
		rgb[rgbOffset + 2] = image.pixelData[source + 2];
		alpha[alphaOffset] = image.pixelData[source + 3];
		rgbOffset += 3;
		alphaOffset += 1;
	}

	return {
		rgb: zlib.deflateSync(rgb),
		alpha: zlib.deflateSync(alpha),
	};
}

// Background
setFillColor(0.973, 0.949, 0.914);
rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'f');

// Main sheet
setFillColor(1, 1, 1);
rect(24, 24, PAGE_WIDTH - 48, PAGE_HEIGHT - 48, 'f');

// Header band
setFillColor(0.075, 0.118, 0.188);
rect(24, PAGE_HEIGHT - 146, PAGE_WIDTH - 48, 122, 'f');

// Accent stripe
setFillColor(0.933, 0.486, 0.161);
rect(24, PAGE_HEIGHT - 146, PAGE_WIDTH - 48, 8, 'f');

setFillColor(1, 1, 1);
drawImage('Im1', 46, 670, 58, 58);

text(118, 712, 'Tepnology LLC', 21, 'F2');
text(118, 688, 'Capability Statement', 14.5, 'F2');
wrappedText(
	118,
	662,
	208,
	'Valet parking, transportation, and facility services for government buyers.',
	9.3,
	12,
	'F1',
);

wrappedText(
	350,
	704,
	200,
	'Focused teaming and service support for public-sector parking operations, transportation coordination, and facility services.',
	9.2,
	11,
	'F1',
);
text(350, 654, 'Primary Contact: Daniela Tep', 9.8, 'F2');
text(350, 638, 'Email: daniela.tep@tepnology.com', 9.8, 'F1');

// Intro
setFillColor(0.129, 0.161, 0.231);
wrappedText(
	44,
	610,
	520,
	'Tepnology LLC delivers responsive support for parking, transportation, and facility-related government requirements. Through its partnership with Mid Atlantic Parking Services (MAPS), Tepnology brings added operational depth for valet and parking-focused pursuits.',
	10.8,
	14,
	'F1',
);

const leftX = 44;
const leftWidth = 316;
let leftY = 556;

sectionTitle(leftX, leftY, 'Core Capabilities');
leftY -= 18;
leftY = bulletList(leftX, leftY, leftWidth, [
	'Valet parking operations, curbside management, and garage support services',
	'Ground transportation coordination, passenger movement support, and shuttle-adjacent services',
	'Special-needs transportation support and customer-facing assistance',
	'Janitorial and facility support services tied to active public-sector environments',
], 10.2, 12.5);

leftY -= 2;
sectionTitle(leftX, leftY, 'Differentiators');
leftY -= 18;
leftY = bulletList(leftX, leftY, leftWidth, [
	'Partnership with Mid Atlantic Parking Services (MAPS) for added parking and valet operations experience',
	'Focused service lanes aligned to recurring federal facility and transportation requirements',
	'Operational mindset centered on staffing continuity, traffic flow, customer service, and safe site support',
	'Responsive small-business team prepared to support outreach, pursuit preparation, and contract execution planning',
], 10.2, 12.5);

leftY -= 2;
sectionTitle(leftX, leftY, 'Past Performance');
leftY -= 18;
leftY = wrappedText(
	leftX,
	leftY,
	leftWidth,
	'Partner experience through MAPS includes valet and parking operations in high-traffic healthcare and commercial environments, with demonstrated capability in staffing continuity, vehicle flow management, and day-to-day customer service delivery.',
	10.2,
	12.5,
	'F1',
);
leftY -= 10;
wrappedText(
	leftX,
	leftY,
	leftWidth,
	'This experience supports pursuits where agencies need dependable front-line operations, orderly traffic movement, and professional service at busy public-facing facilities.',
	10.2,
	12.5,
	'F1',
);

const rightX = 380;
const cardWidth = 188;
card(rightX, 560, cardWidth, 146, 'Company Data', [
	'Company: Tepnology LLC',
	'UEI: SGWXSNU51EA5',
	'CAGE: 8ZCP5',
	'Teaming Partner: Mid Atlantic Parking Services (MAPS)',
	'Status: Verify socioeconomic certifications for each pursuit, including SDVOSB when applicable',
]);

card(rightX, 404, cardWidth, 120, 'NAICS Codes', [
	'812930 - Parking Lots and Garages',
	'485991 - Special Needs Transportation',
	'485999 - Ground Passenger Transportation',
	'561720 - Janitorial Services',
]);

card(rightX, 274, cardWidth, 136, 'Target Agencies', [
	'Federal civilian agencies with parking, transportation, or facility service requirements',
	'Healthcare and campus-style public facilities',
	'Buyers seeking dependable front-line operations and customer-facing support',
]);

card(rightX, 128, cardWidth, 96, 'Contact Information', [
	'Daniela Tep',
	'Tepnology LLC',
	'daniela.tep@tepnology.com',
]);

setStrokeColor(0.894, 0.843, 0.761);
line(44, 50, 568, 50);
setFillColor(0.424, 0.455, 0.514);
text(
	44,
	34,
	'Prepared for government outreach, market research responses, and teaming discussions.',
	9.2,
	'F1',
);

const content = ops.join('\n');
const contentBuffer = Buffer.from(content, 'utf8');
const logoImage = cropRgbaImage(parsePng(LOGO_PATH), 650, 250, 620, 420);
const logoChannels = splitRgbaChannels(logoImage);

const objects = [
	{ id: 1, buffer: Buffer.from('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n', 'utf8') },
	{ id: 2, buffer: Buffer.from('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n', 'utf8') },
	{
		id: 3,
		buffer: Buffer.from(
			'3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /Im1 6 0 R >> >> /Contents 8 0 R >>\nendobj\n',
			'utf8',
		),
	},
	{ id: 4, buffer: Buffer.from('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n', 'utf8') },
	{ id: 5, buffer: Buffer.from('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n', 'utf8') },
	{
		id: 6,
		buffer: Buffer.concat([
			Buffer.from(
				`6 0 obj\n<< /Type /XObject /Subtype /Image /Width ${logoImage.width} /Height ${logoImage.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /SMask 7 0 R /Length ${logoChannels.rgb.length} >>\nstream\n`,
				'utf8',
			),
			logoChannels.rgb,
			Buffer.from('\nendstream\nendobj\n', 'utf8'),
		]),
	},
	{
		id: 7,
		buffer: Buffer.concat([
			Buffer.from(
				`7 0 obj\n<< /Type /XObject /Subtype /Image /Width ${logoImage.width} /Height ${logoImage.height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${logoChannels.alpha.length} >>\nstream\n`,
				'utf8',
			),
			logoChannels.alpha,
			Buffer.from('\nendstream\nendobj\n', 'utf8'),
		]),
	},
	{
		id: 8,
		buffer: Buffer.concat([
			Buffer.from(
				`8 0 obj\n<< /Length ${contentBuffer.length} >>\nstream\n`,
				'utf8',
			),
			contentBuffer,
			Buffer.from('\nendstream\nendobj\n', 'utf8'),
		]),
	},
];

const headerBuffer = Buffer.from('%PDF-1.4\n', 'utf8');
const parts = [headerBuffer];
const offsets = [0];
let position = headerBuffer.length;

for (const object of objects) {
	offsets[object.id] = position;
	parts.push(object.buffer);
	position += object.buffer.length;
}

const xrefOffset = position;
let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

for (let objectId = 1; objectId <= objects.length; objectId += 1) {
	xref += `${String(offsets[objectId]).padStart(10, '0')} 00000 n \n`;
}

xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
parts.push(Buffer.from(xref, 'utf8'));

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, Buffer.concat(parts));

console.log(`Wrote ${OUTPUT_PATH}`);
