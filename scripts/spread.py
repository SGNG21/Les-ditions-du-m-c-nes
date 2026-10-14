"""Répartit les couvertures d'une même famille (éditions jumelles, séries) pour qu'elles ne se suivent pas."""
import re
FAM = [('lacroix','christian-lacroix'),('scene','betes-de-scene','animales-a-escena'),('qui','a-qui-appartient','who-owns-paris'),
       ('vaut','que-vaut'),('puces','puces-de'),('noureev','rudolf-nur','rudolf-noureev'),('passages','passage','arcades','livre-des-passages'),
       ('marville','charles-marville'),('haussmann','paris-d-haussmann'),('elysee','palais-de-l-elysee')]
def fam(slug):
    for f,*keys in FAM:
        if any(k in slug for k in keys): return f
    return slug
def spread(seq, key):
    out=list(seq)
    for _ in range(len(out)*2):
        bad=[i for i in range(1,len(out)) if fam(key(out[i]))==fam(key(out[i-1]))]
        if not bad: break
        i=bad[0]; x=out.pop(i)
        # place x at the first spot where neither neighbour shares its family, searching forward then from the start
        order=list(range(i+1,len(out)+1))+list(range(0,i))
        for j in order:
            l=out[j-1] if j>0 else None; r=out[j] if j<len(out) else None
            if (l is None or fam(key(l))!=fam(key(x))) and (r is None or fam(key(r))!=fam(key(x))):
                out.insert(j,x); break
        else: out.insert(i,x); break
    return out
