export const getAngleRad = (playerX: number, playerY: number, pointerX: number, pointerY: number) => {
	return Math.atan2(pointerY - playerY, pointerX - playerX) + Math.PI/2;
};