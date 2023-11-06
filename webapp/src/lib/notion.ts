import { Client } from "@notionhq/client";
import type { documentationKeys } from "./documentation";

// Initializing a client
export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const createDocumentationPage = async (
  documentation: documentationKeys,
  database_id: string,
) => {
  const response = await notion.pages.create({
    cover: {
      type: "external",
      external: {
        url: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      },
    },
    icon: {
      type: "emoji",
      emoji: "📘",
    },
    parent: {
      type: "database_id",
      database_id,
      // database_id: "8406896752134c44a505205ba9d72f43",
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: "Documentation",
            },
          },
        ],
      },
    },
    children: [
      {
        object: "block",
        heading_3: {
          rich_text: [
            {
              text: {
                content: "This documentation was bootstrapped with Dionysus!",
                link: {
                  url: "https://Dionysus.vercel.app",
                },
              },
            },
          ],
          color: "default",
        },
      },
      {
        object: "block",
        heading_3: {
          rich_text: [
            {
              text: {
                content: "Introduction",
              },
            },
          ],
        },
      },
      {
        object: "block",
        paragraph: {
          rich_text: documentation["What is the project about?"]
            .split("\n")
            .map((line) => {
              return {
                text: {
                  content: line.slice(0, 2000) + "\n",
                },
              };
            }),
        },
      },
      {
        object: "block",
        heading_3: {
          rich_text: [
            {
              text: {
                content: "Getting Started",
              },
            },
          ],
        },
      },
      {
        object: "block",
        paragraph: {
          rich_text: documentation["How can I get started with this project?"]
            .split("\n")
            .map((line) => {
              return {
                text: {
                  content: line.slice(0, 2000) + "\n",
                },
              };
            }),
        },
      },
      {
        object: "block",
        heading_3: {
          rich_text: [
            {
              text: {
                content: "Repository",
              },
            },
          ],
        },
      },
      {
        object: "block",
        paragraph: {
          rich_text: documentation[
            "What does the project's repository contain?"
          ]
            .split("\n")
            .map((line) => {
              return {
                text: {
                  content: line.slice(0, 2000) + "\n",
                },
              };
            }),
        },
      },
      {
        object: "block",
        heading_3: {
          rich_text: [
            {
              text: {
                content: "Coding Standard",
              },
            },
          ],
        },
      },
      {
        object: "block",
        paragraph: {
          rich_text: documentation[
            "Are there any coding standards or guidelines I should follow?"
          ]
            .split("\n")
            .map((line) => {
              return {
                text: {
                  content: line.slice(0, 2000) + "\n",
                },
              };
            }),
        },
      },
      {
        object: "block",
        heading_3: {
          rich_text: [
            {
              text: {
                content: "Dependencies",
              },
            },
          ],
        },
      },
      {
        object: "block",
        paragraph: {
          rich_text: documentation[
            "What dependencies, packages, APIs, or libraries does the project use? Look into the package.json file."
          ]
            .split("\n")
            .map((line) => {
              return {
                text: {
                  content: line.slice(0, 2000) + "\n",
                },
              };
            }),
        },
      },
      {
        object: "block",
        heading_3: {
          rich_text: [
            {
              text: {
                content: "Building and Compiling",
              },
            },
          ],
        },
      },
      {
        object: "block",
        paragraph: {
          rich_text: documentation["How can I build and compile the project?"]
            .split("\n")
            .map((line) => {
              return {
                text: {
                  content: line.slice(0, 2000) + "\n",
                },
              };
            }),
        },
      },
      {
        object: "block",
        heading_3: {
          rich_text: [
            {
              text: {
                content: "Testing",
              },
            },
          ],
        },
      },
      {
        object: "block",
        paragraph: {
          rich_text: documentation[
            "What should I know about testing in this project?"
          ]
            .split("\n")
            .map((line) => {
              return {
                text: {
                  content: line.slice(0, 2000) + "\n",
                },
              };
            }),
        },
      },
      {
        object: "block",
        heading_3: {
          rich_text: [
            {
              text: {
                content: "Contributing",
              },
            },
          ],
        },
      },
      {
        object: "block",
        paragraph: {
          rich_text: documentation["How can I contribute to the project?"]
            .split("\n")
            .map((line) => {
              return {
                text: {
                  content: line.slice(0, 2000) + "\n",
                },
              };
            }),
        },
      },
      {
        object: "block",
        heading_3: {
          rich_text: [
            {
              text: {
                content: "Issues",
              },
            },
          ],
        },
      },
      {
        object: "block",
        paragraph: {
          rich_text: documentation["How are issues tracked in this project?"]
            .split("\n")
            .map((line) => {
              return {
                text: {
                  content: line.slice(0, 2000) + "\n",
                },
              };
            }),
        },
      },
      {
        object: "block",
        heading_3: {
          rich_text: [
            {
              text: {
                content: "Version Control",
              },
            },
          ],
        },
      },
      {
        object: "block",
        paragraph: {
          rich_text: documentation[
            "What's the version control strategy for this project?"
          ]
            .split("\n")
            .map((line) => {
              return {
                text: {
                  content: line.slice(0, 2000) + "\n",
                },
              };
            }),
        },
      },
      {
        object: "block",
        heading_3: {
          rich_text: [
            {
              text: {
                content: "CI/CD",
              },
            },
          ],
        },
      },
      {
        object: "block",
        paragraph: {
          rich_text: documentation[
            "Tell me about the project's CI/CD pipeline."
          ]
            .split("\n")
            .map((line) => {
              return {
                text: {
                  content: line.slice(0, 2000) + "\n",
                },
              };
            }),
        },
      },
    ],
  });

  return response;
};
