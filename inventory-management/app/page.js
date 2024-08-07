'use client'

import { useState, useEffect } from 'react'
import { Grid, Card, CardContent, CardActions, Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  // Initializing the state variables
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Function to update the inventory, needs to be asynchronous otherwise the site will be frozen while it fetches
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];

    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  }

  const addItem = async(item, amount = 1) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if(docSnap.exists()) {
      const {quantity} = docSnap.data();
      await setDoc(docRef, { quantity: quantity + amount });
    } else {
      await setDoc(docRef, {quantity: amount});
    }
    await updateInventory();
  }

  const removeItem = async(item, amount = 1) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if(docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity - amount < 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {quantity: quantity - amount});
      }
    }
    await updateInventory();
  }

  const searchInventory = () => {
    const filteredItems = inventory.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setInventory(filteredItems);
    setSearchTerm('');
    setSearchOpen(false);
  }

  // This function updates whenever something in the dependency array changes, the dependency array is the second argument (the empty array passed)
  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              id="outlined-basic"
              type="number"
              label="Amount"
              variant="outlined"
              fullWidth
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName, )
                setItemName('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      {/* Search Item Modal */}
      <Modal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        aria-labelledby="search-modal-title"
        aria-describedby="search-modal-description"
      >
        <Box sx={style}>
          <Typography id="search-modal-title" variant="h6" component="h2">
            Search Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="search-outlined-basic"
              label="Search"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={searchInventory}
            >
              Search
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>
      <Button variant="contained" onClick={() => setSearchOpen(true)}>
        Search Item
      </Button>
      <Button variant="contained" onClick= { () => updateInventory()}>
        Reset
      </Button>
      <Box border={'1px solid #333'}>
        <Box
          width="800px"
          height="100px"
          bgcolor={'#ADD8E6'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {inventory.map(({ name, quantity }) => (
            <Grid item xs={12} sm={6} md={4} key={name}>
              <Card>
                <CardContent>
                  <Typography variant="h5">{name}</Typography>
                  <Typography variant="body2">Quantity: {quantity}</Typography>
                </CardContent>
                <CardActions>
                  <Button variant="contained" onClick={() => addItem(name)}>
                    +
                  </Button>
                  <Button variant="contained" onClick={() => { removeItem(name)}}>
                    -
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  ) 
}
