import { handleYoutubeWorkoutPost } from "@/lib/youtube-workouts";

export const POST = (request: Request, { params }: { params: Promise<{ videoId: string }> }) => handleYoutubeWorkoutPost(request, params, "youtube.create_workout");
