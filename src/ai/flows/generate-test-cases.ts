
'use server';

/**
 * @fileOverview Generates basic test cases for a Solidity smart contract.
 *
 * - generateTestCases - A function that triggers the test case generation flow.
 * - GenerateTestCasesInput - The input type for the generateTestCases function.
 * - GenerateTestCasesOutput - The return type for the generateTestCases function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTestCasesInputSchema = z.object({
  code: z.string().describe('The Solidity smart contract code for which to generate test cases.'),
  contractName: z.string().optional().describe('Optional: The main contract name to focus on. If not provided, the AI will attempt to infer it.'),
});
export type GenerateTestCasesInput = z.infer<typeof GenerateTestCasesInputSchema>;

const GenerateTestCasesOutputSchema = z.object({
  testCasesCode: z.string().describe('The generated test cases code as a JavaScript string, suitable for Hardhat (using ethers.js and Chai).'),
});
export type GenerateTestCasesOutput = z.infer<typeof GenerateTestCasesOutputSchema>;

export async function generateTestCases(input: GenerateTestCasesInput): Promise<GenerateTestCasesOutput> {
  return generateTestCasesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTestCasesPrompt',
  input: {schema: GenerateTestCasesInputSchema},
  output: {schema: GenerateTestCasesOutputSchema},
  prompt: `You are an expert Smart Contract Test Engineer specializing in Solidity and Hardhat.
Your task is to generate a basic Hardhat test suite (using JavaScript, ethers.js, and Chai) for the provided Solidity smart contract code.

Solidity Code:
\`\`\`solidity
{{{code}}}
\`\`\`

{{#if contractName}}
Focus on the contract named: {{{contractName}}}
{{else}}
Identify the main contract in the provided Solidity code to focus the tests on.
{{/if}}

Your generated test suite should:
1.  Include necessary imports: \`const { expect } = require("chai");\` and \`const { ethers } = require("hardhat");\`.
2.  Have a top-level \`describe\` block for the contract.
3.  Include a \`beforeEach\` block to deploy a fresh instance of the contract before each test. If the constructor requires arguments, make reasonable assumptions for simple types (e.g., use default values or placeholders like "TestToken", "TTK", 1000000 for an ERC20). If constructor arguments are complex or require external contracts, make a comment // TODO: Update constructor arguments as needed.
4.  Generate \`it\` blocks for basic test cases covering public and external functions:
    *   Focus on "happy path" scenarios (i.e., functions behaving as expected with valid inputs).
    *   Include basic checks for \`require\` statements or custom errors if they are obvious from the function logic (e.g., \`await expect(contract.myFunction(...invalidArgs)).to.be.revertedWith("Expected error message");\`).
    *   For state-changing functions, verify the state change (e.g., checking a balance after a transfer).
    *   For view/pure functions, verify the returned values.
5.  Ensure the output is a single block of JavaScript code. Do not include any explanatory text outside the code block itself (comments within the code are fine).
6.  If the contract is an ERC20 token, include basic tests for name, symbol, decimals (if present), and totalSupply. A simple transfer test would also be good.
7.  If the contract is Ownable (imports OpenZeppelin's Ownable or has a similar pattern), include a test to check that only the owner can call a restricted function and that others cannot.

Example structure:
\`\`\`javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("YourContractName", function () {
  let yourContract;
  let owner;
  let addr1;
  // Add more signers if needed

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners(); // Add more signers if needed
    const YourContractFactory = await ethers.getContractFactory("YourContractName");
    // TODO: Update constructor arguments if necessary
    yourContract = await YourContractFactory.deploy(/* constructor arguments */);
    // await yourContract.deployed(); // .deployed() is deprecated, deployment is confirmed when the promise resolves.
  });

  it("Should correctly deploy and set initial values (if any)", async function () {
    // Example: expect(await yourContract.someValue()).to.equal(initialValue);
  });

  // Add more it() blocks for other functions
});
\`\`\`

Generate the test cases code now.
`,
});

const generateTestCasesFlow = ai.defineFlow(
  {
    name: 'generateTestCasesFlow',
    inputSchema: GenerateTestCasesInputSchema,
    outputSchema: GenerateTestCasesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate test cases.");
    }
    // Ensure the output is just the code block, try to strip markdown if present
    let code = output.testCasesCode;
    if (code.startsWith("```javascript")) {
      code = code.substring("```javascript".length);
    }
    if (code.endsWith("```")) {
      code = code.substring(0, code.length - "```".length);
    }
    return { testCasesCode: code.trim() };
  }
);

