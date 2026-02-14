const TRACKMAN_GRAPHQL_URL = "https://api.trackmanrange.com/graphql";

const GET_COURSES_LIST = `
query getCoursesList($skip: Int, $take: Int) {
  courses(skip: $skip, take: $take) {
    items {
      id
      dbId
      createdAt
      description
      displayName
      numbersOfHoles
      worldLocation {
        googleMapUrl
        latitude
        longitude
      }
      courseLocation
      tags
      holes {
        name
        tees {
          distance
          strokeIndex
          par
        }
        images {
          url
        }
      }
      difficulty
      tees {
        par
        courseDistance
        courseRating
        slope
        gender
        kind
        name
      }
      image {
        url
      }
      video {
        url
      }
    }
  }
}
`;

export type TrackmanTee = {
  par?: number | null;
  courseDistance?: number | null;
  courseRating?: number | null;
  slope?: number | null;
  gender?: string | null;
  kind?: string | null;
  name?: string | null;
};

export type TrackmanCourseItem = {
  id: string;
  dbId?: string | null;
  createdAt?: string | null;
  description?: string | null;
  displayName: string;
  numbersOfHoles?: number | null;
  worldLocation?: {
    googleMapUrl?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  courseLocation?: string | null;
  tags?: string[] | null;
  holes?: Array<{
    name?: string | null;
    tees?: Array<{
      distance?: number | null;
      strokeIndex?: number | null;
      par?: number | null;
    }> | null;
    images?: Array<{ url?: string | null }> | null;
  }> | null;
  difficulty?: number | null;
  tees?: TrackmanTee[] | null;
  image?: { url?: string | null } | null;
  video?: { url?: string | null } | null;
};

type GetCoursesListResponse = {
  data?: {
    courses?: {
      items: TrackmanCourseItem[];
    } | null;
  } | null;
  errors?: Array<{ message: string }>;
};

export async function getCoursesList(
  skip: number = 0,
  take: number = 8000
): Promise<TrackmanCourseItem[]> {
  const res = await fetch(TRACKMAN_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: GET_COURSES_LIST,
      variables: { skip, take },
    }),
  });

  if (!res.ok) {
    throw new Error(`Trackman API HTTP ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as GetCoursesListResponse;

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; ") || "GraphQL errors");
  }

  const items = json.data?.courses?.items ?? [];
  return items;
}
