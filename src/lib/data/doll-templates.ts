// Paper Doll Template Definitions
// This file contains all template metadata until we migrate to database

export type DollBodyType = 'average' | 'curvy' | 'petite';
export type DollPose = 'pose-a' | 'pose-b';

export interface OutfitRegion {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface DollTemplate {
	id: string;
	name: string;
	displayName: string; // User-friendly name
	pose: DollPose;
	poseDescription: string;
	bodyType: DollBodyType;
	bodyTypeDisplay: string; // Positive, inclusive label
	baseImageUrl: string;
	viewBox: {
		width: number;
		height: number;
	};
	regions: {
		topRegion: OutfitRegion;
		bottomRegion: OutfitRegion;
		dressRegion: OutfitRegion;
		shoesRegion: OutfitRegion;
	};
}

export const DOLL_TEMPLATES: DollTemplate[] = [
	// Pose A - Arms Out (Classic Paper Doll Pose)
	{
		id: 'pose-a-average',
		name: 'pose-a-average',
		displayName: 'Classic Pose',
		pose: 'pose-a',
		poseDescription: 'Arms out to the sides',
		bodyType: 'average',
		bodyTypeDisplay: 'Classic Build',
		baseImageUrl: '/templates/dolls/pose-a-average.svg',
		viewBox: {
			width: 400,
			height: 600
		},
		regions: {
			topRegion: { x: 145, y: 225, width: 110, height: 110 },
			bottomRegion: { x: 160, y: 380, width: 80, height: 120 },
			dressRegion: { x: 145, y: 225, width: 110, height: 270 },
			shoesRegion: { x: 160, y: 540, width: 80, height: 30 }
		}
	},
	{
		id: 'pose-a-curvy',
		name: 'pose-a-curvy',
		displayName: 'Classic Pose',
		pose: 'pose-a',
		poseDescription: 'Arms out to the sides',
		bodyType: 'curvy',
		bodyTypeDisplay: 'Curvy Build',
		baseImageUrl: '/templates/dolls/pose-a-curvy.svg',
		viewBox: {
			width: 400,
			height: 600
		},
		regions: {
			topRegion: { x: 130, y: 220, width: 140, height: 115 },
			bottomRegion: { x: 155, y: 380, width: 90, height: 120 },
			dressRegion: { x: 130, y: 220, width: 140, height: 280 },
			shoesRegion: { x: 155, y: 540, width: 90, height: 30 }
		}
	},
	{
		id: 'pose-a-petite',
		name: 'pose-a-petite',
		displayName: 'Classic Pose',
		pose: 'pose-a',
		poseDescription: 'Arms out to the sides',
		bodyType: 'petite',
		bodyTypeDisplay: 'Petite Build',
		baseImageUrl: '/templates/dolls/pose-a-petite.svg',
		viewBox: {
			width: 400,
			height: 600
		},
		regions: {
			topRegion: { x: 155, y: 240, width: 90, height: 100 },
			bottomRegion: { x: 170, y: 390, width: 60, height: 115 },
			dressRegion: { x: 155, y: 240, width: 90, height: 260 },
			shoesRegion: { x: 170, y: 540, width: 60, height: 30 }
		}
	},

	// Pose B - Arms Down
	{
		id: 'pose-b-average',
		name: 'pose-b-average',
		displayName: 'Standing Pose',
		pose: 'pose-b',
		poseDescription: 'Arms down at sides',
		bodyType: 'average',
		bodyTypeDisplay: 'Classic Build',
		baseImageUrl: '/templates/dolls/pose-b-average.svg',
		viewBox: {
			width: 400,
			height: 600
		},
		regions: {
			topRegion: { x: 145, y: 225, width: 110, height: 110 },
			bottomRegion: { x: 160, y: 380, width: 80, height: 120 },
			dressRegion: { x: 145, y: 225, width: 110, height: 270 },
			shoesRegion: { x: 160, y: 540, width: 80, height: 30 }
		}
	},
	{
		id: 'pose-b-curvy',
		name: 'pose-b-curvy',
		displayName: 'Standing Pose',
		pose: 'pose-b',
		poseDescription: 'Arms down at sides',
		bodyType: 'curvy',
		bodyTypeDisplay: 'Curvy Build',
		baseImageUrl: '/templates/dolls/pose-b-curvy.svg',
		viewBox: {
			width: 400,
			height: 600
		},
		regions: {
			topRegion: { x: 130, y: 220, width: 140, height: 115 },
			bottomRegion: { x: 155, y: 380, width: 90, height: 120 },
			dressRegion: { x: 130, y: 220, width: 140, height: 280 },
			shoesRegion: { x: 155, y: 540, width: 90, height: 30 }
		}
	},
	{
		id: 'pose-b-petite',
		name: 'pose-b-petite',
		displayName: 'Standing Pose',
		pose: 'pose-b',
		poseDescription: 'Arms down at sides',
		bodyType: 'petite',
		bodyTypeDisplay: 'Petite Build',
		baseImageUrl: '/templates/dolls/pose-b-petite.svg',
		viewBox: {
			width: 400,
			height: 600
		},
		regions: {
			topRegion: { x: 155, y: 240, width: 90, height: 100 },
			bottomRegion: { x: 170, y: 390, width: 60, height: 115 },
			dressRegion: { x: 155, y: 240, width: 90, height: 260 },
			shoesRegion: { x: 170, y: 540, width: 60, height: 30 }
		}
	}
];

// Helper functions
export function getTemplateById(id: string): DollTemplate | undefined {
	return DOLL_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByPose(pose: DollPose): DollTemplate[] {
	return DOLL_TEMPLATES.filter((t) => t.pose === pose);
}

export function getTemplatesByBodyType(bodyType: DollBodyType): DollTemplate[] {
	return DOLL_TEMPLATES.filter((t) => t.bodyType === bodyType);
}

export const BODY_TYPE_DESCRIPTIONS: Record<DollBodyType, string> = {
	average: 'Classic proportions, perfect for all designs',
	curvy: 'Fuller figure, celebrates beautiful curves',
	petite: 'Smaller frame, great for delicate designs'
};

export const POSE_DESCRIPTIONS: Record<DollPose, string> = {
	'pose-a': 'Classic paper doll pose with arms out - perfect for jackets and accessories',
	'pose-b': 'Standing pose with arms down - great for dresses and flowing designs'
};
