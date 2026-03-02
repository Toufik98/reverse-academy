import type { LearningPath, Step, Domain, Difficulty, PathMode, StepType } from '$types/path';

// ─── Admin API types ─────────────────────────────────────────────

export interface AdminStats {
	total_paths: number;
	total_steps: number;
	total_users: number;
	total_achievements: number;
	paths_by_domain: Array<{ domain: string; count: number }>;
	paths_by_difficulty: Array<{ difficulty: string; count: number }>;
}

export interface AdminMessage {
	message: string;
	id?: string;
}

export interface CreatePathPayload {
	slug: string;
	title: string;
	domain: string;
	mode: string;
	difficulty: string;
	description: string;
	estimatedMinutes: number;
	xpReward: number;
}

export interface UpdatePathPayload {
	title?: string;
	domain?: string;
	mode?: string;
	difficulty?: string;
	description?: string;
	estimatedMinutes?: number;
	xpReward?: number;
}

export interface CreateStepPayload {
	title: string;
	stepType: string;
	content: Record<string, unknown>;
	hint?: string;
	xpReward: number;
	order?: number;
}

export interface UpdateStepPayload {
	title?: string;
	stepType?: string;
	content?: Record<string, unknown>;
	hint?: string;
	xpReward?: number;
}

export interface PathListItem {
	id: string;
	slug: string;
	title: string;
	domain: string;
	mode: string;
	difficulty: string;
	description: string;
	estimatedMinutes: number;
	xpReward: number;
	stepCount: number;
	firstStepId: string;
}

// ─── Admin API client ────────────────────────────────────────────

export class AdminAPI {
	private baseUrl: string;
	private token: string;

	constructor(baseUrl: string, token: string) {
		this.baseUrl = baseUrl;
		this.token = token;
	}

	private headers(): Record<string, string> {
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.token}`
		};
	}

	private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
		const res = await fetch(`${this.baseUrl}${path}`, {
			...options,
			headers: { ...this.headers(), ...(options.headers as Record<string, string>) }
		});
		if (!res.ok) {
			const text = await res.text();
			throw new Error(`${res.status}: ${text}`);
		}
		return res.json();
	}

	// Stats
	async getStats(): Promise<AdminStats> {
		return this.request('/api/v1/admin/stats');
	}

	// Paths
	async listPaths(): Promise<PathListItem[]> {
		return this.request('/api/v1/paths');
	}

	async getPath(slug: string): Promise<LearningPath> {
		return this.request(`/api/v1/paths/${slug}`);
	}

	async createPath(data: CreatePathPayload): Promise<AdminMessage> {
		return this.request('/api/v1/admin/paths', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async updatePath(id: string, data: UpdatePathPayload): Promise<AdminMessage> {
		return this.request(`/api/v1/admin/paths/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data)
		});
	}

	async deletePath(id: string): Promise<AdminMessage> {
		return this.request(`/api/v1/admin/paths/${id}`, {
			method: 'DELETE'
		});
	}

	// Steps
	async createStep(pathId: string, data: CreateStepPayload): Promise<AdminMessage> {
		return this.request(`/api/v1/admin/paths/${pathId}/steps`, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async updateStep(pathId: string, stepId: string, data: UpdateStepPayload): Promise<AdminMessage> {
		return this.request(`/api/v1/admin/paths/${pathId}/steps/${stepId}`, {
			method: 'PUT',
			body: JSON.stringify(data)
		});
	}

	async deleteStep(pathId: string, stepId: string): Promise<AdminMessage> {
		return this.request(`/api/v1/admin/paths/${pathId}/steps/${stepId}`, {
			method: 'DELETE'
		});
	}

	async reorderSteps(pathId: string, stepIds: string[]): Promise<AdminMessage> {
		return this.request(`/api/v1/admin/paths/${pathId}/steps/reorder`, {
			method: 'POST',
			body: JSON.stringify({ step_ids: stepIds })
		});
	}

	// Import / Export
	async importPath(data: LearningPath): Promise<AdminMessage> {
		return this.request('/api/v1/admin/import', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async exportPath(id: string): Promise<LearningPath> {
		return this.request(`/api/v1/admin/paths/${id}/export`);
	}
}
