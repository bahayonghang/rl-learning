import { researchSources } from '../research';
import { reviewSources } from '../../research/sources';
import type { Source } from '../../types';
/** Preserve the six legacy IDs while using the independently verified English notes. */
export const researchSourcesEn:Source[]=researchSources.map(source=>{
 const verified=reviewSources.find(item=>item.url.toLowerCase()===source.url.toLowerCase());
 if(!verified)throw new Error(`Missing English research reference: ${source.id}`);
 return {...source,note:verified.noteEn};
});
