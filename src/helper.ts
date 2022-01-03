export const getAngleRad = (objectX: number, objectY: number, targetX: number, targetY: number) => {
	return Math.atan2(targetY - objectY, targetX - objectX) + Math.PI / 2;
};