import { Story, Meta } from "@storybook/react";
import { EditorForStory, StorybookEditorProps } from "./Editor";
import * as JSONTools from "json-antlr-tools-ts";

export default {
    title: "Editor/JSON",
    component: EditorForStory,
    argTypes: {
        tools: { table: { disable: true } },
        def: { table: { disable: true } },
        variables: { table: { disable: true } },
        variableURLs: { table: { disable: true } },
        options: { table: { disable: true } },
    },
} as Meta;

const Template: Story<StorybookEditorProps> = args => <EditorForStory {...args} />;

const defDefault = <h3>Insert JSON script</h3>;
export const Default = Template.bind({});
Default.args = {
    initialScript: '{"key": "value"}',
    readOnly: false,
    tools: JSONTools,
    languageVersion: "json",
    def: defDefault,
};
