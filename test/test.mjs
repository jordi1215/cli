import Configstore from 'configstore';
import { link } from 'fs';

// Create a Configstore instance.

const config = new Configstore("cli", { path: 'bar' });